import * as Dice from "../helpers/dice.js";

export default class tinydsaActorSheet extends ActorSheet {
    getData() {
        const data = super.getData();

        data.config = CONFIG.tinydsa;
        data.config.heritageHeaderPath = `tinydsa.actor.${data.config.theme}.heritage.header`;
        data.config.characterHeaderPath = `tinydsa.actor.${data.config.theme}.character`;
        data.config.heritageTraitPath = `tinydsa.actor.${data.config.theme}.heritage.traits`;
        data.config.heritageDeleteTooltipPath = `tinydsa.actor.${data.config.theme}.heritage.delete`;

        // Determine optional element display based on settings
        data.config.enableCorruption = game.settings.get('tinydsa', 'enableCorruption');
        data.config.enableDamageReduction = game.settings.get('tinydsa', 'enableDamageReduction');
        data.config.advancementMethod = game.settings.get('tinydsa', 'enableAdvancement');
        
        data.owner = this.actor.owner;
        data.traits = data.items.filter(item => { return item.type === "trait" });
        data.weapons = data.items.filter(item => { return item.type === "weapon" && item.data.equipped });
        data.armor = data.items.filter(item => { return item.type === "armor" && item.data.equipped });
        data.gear = data.items.filter(item => { return item.type !== "trait" && item.type !== "heritage" });

        return data;
    }

    activateListeners(html)
    {
        html.find(".item-add").click(this._onItemCreate.bind(this));
        html.find(".item-show").click(this._onItemShow.bind(this));
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        html.find(".item-equip").click(this._onItemEquip.bind(this));
        html.find(".roll-dice").click(this._onDieRoll.bind(this));

        html.find('.editor-content[data-edit]').each((i, div) => this._activateEditor(div));
        html.find(".health-box").on('click change', this._setCurrentDamage.bind(this));

        super.activateListeners(html);
    }

    activateEditor(name, options={}, initialContent="") {
        const editor = this.editors[name];
        if ( !editor ) throw new Error(`${name} is not a registered editor name!`);
        options = mergeObject(editor.options, options);
        options.height = options.target.offsetHeight;
        TextEditor.create(options, initialContent || editor.initial).then(mce => {
            editor.mce = mce;
            editor.changed = false;
            editor.active = true;
            mce.focus();
            mce.on('change', ev => editor.changed = true);
        });
    }

    /**
     * Activate a TinyMCE editor instance present within the form
     * @param div {HTMLElement}
     * @private
     */
    _activateEditor(div) {
        // Get the editor content div
        const name = div.getAttribute("data-edit");
        const button = div.nextElementSibling;
        const hasButton = button && button.classList.contains("editor-edit");
        const wrap = div.parentElement.parentElement;
        const wc = $(div).parents(".window-content")[0];

        // Determine the preferred editor height
        const heights = [wrap.offsetHeight, wc ? wc.offsetHeight : null];
        if ( div.offsetHeight > 0 ) heights.push(div.offsetHeight);
        let height = Math.min(...heights.filter(h => Number.isFinite(h)));

        // Get initial content
        const data = this.entity instanceof Entity ? this.entity.data : this.entity;
        const initialContent = getProperty(data, name);
        const editorOptions = {
            target: div,
            height: height,
            save_onsavecallback: mce => this.saveEditor(name)
        };

        // Add record to editors registry
        this.editors[name] = {
            target: name,
            button: button,
            hasButton: hasButton,
            mce: null,
            active: !hasButton,
            changed: false,
            options: editorOptions,
            initial: initialContent
        };

        // If we are using a toggle button, delay activation until it is clicked
        if (hasButton) button.onclick = event => {
            button.style.display = "none";
            this.activateEditor(name, editorOptions, initialContent);
        };
        // Otherwise activate immediately
        else this.activateEditor(name, editorOptions, initialContent);
    }

    async _onDieRoll(event)
    {
        event.preventDefault();
        const element = event.currentTarget;

        const rollData = {
            numberOfDice: element.dataset.diceX,
            defaultThreshold: element.dataset.threshold,
            focusAction: element.dataset.enableFocus,
            marksmanTrait: element.dataset.enableMarksman
        };

        Dice.RollTest(rollData);
    }

    _onItemCreate(event)
    {
        event.preventDefault();
        let element = event.currentTarget;

        let itemData = {
            name: game.i18n.localize("tinydsa.sheet.newItem"),
            img: CONFIG.tinydsa.defaultItemImage,
            type: element.dataset.type
        };

        return this.actor.createOwnedItem(itemData);
    }

    _onItemDelete(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest("[data-item-id]").dataset.itemId;
        return this.actor.deleteOwnedItem(itemId);
    }

    _onItemShow(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest("[data-item-id]").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);

        item.sheet.render(true);
    }

    _onItemEquip(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest("[data-item-id]").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);

        return this.actor.updateOwnedItem(this._toggleEquipped(itemId, item));
    }

    _toggleActionButton(event)
    {
        const element = event.element;
        element.getElementsByClassName('.hidden').toggleClass('hidden');
    }

    _toggleEquipped(id, item) {
        return {
            _id: id,
            data: {
                equipped: !item.data.data.equipped,
            },
        };
    }

    _setCurrentDamage(event)
    {
        event.preventDefault();

        const element = event.currentTarget;
        const currentDamage = parseInt(this.actor.data.data.wounds.value ?? 0);
        if (element.checked)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    wounds: {
                        value: (currentDamage + 1)
                    },
                    advancement: {
                        max: 3
                    }
                }
            });
        }
        else if (currentDamage > 0)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    wounds: {
                        value: (currentDamage - 1)
                    }
                }
            });
        }
    }
}
