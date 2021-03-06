import tinydsaActorSheet from "./tinydsaActorSheet.js";
import * as Dice from "../helpers/dice.js";

export default class tinydsaHeroSheet extends tinydsaActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            height: 640,
            template: "systems/tinydsa/templates/sheets/hero-sheet.hbs",
            classes: [ "tinydsa", "sheet", "hero", game.settings.get("tinydsa", "theme") ]
        });
    }

    getData() {
        const data = super.getData();

        data.heritage = data.items.filter(item => { return item.type === "heritage" })[0];
        data.data.xp.remaining = data.data.xp.max - data.data.xp.spent;

        data.armorTotal = 0;
        data.armor.forEach((item, n) => {
            data.armorTotal += item.data.damageReduction;
        });
        
        return data;
    }

    activateListeners(html)
    {
        html.find(".toggle-focus").click(this._setFocusAction.bind(this));
        html.find(".toggle-marksman").on('click change', this._setMarksmanTrait.bind(this));
        html.find(".corruption-box").on('click change', this._setCurrentCorruption.bind(this));
        html.find(".advancement-progress-box").on('click change', this._setAdvancementProgress.bind(this));

        super.activateListeners(html);
    }

    _setFocusAction(event)
    {
        const element = event.currentTarget;

        const form = $(element.closest("form"));
        Dice.setFocusOption(form, element);
    }

    _setMarksmanTrait(event)
    {
        const element = event.currentTarget;

        const form = $(element.closest("form"));
        Dice.setMarksmanOption(form, element);
    }

    _setCurrentCorruption(event)
    {
        event.preventDefault();

        const element = event.currentTarget;
        const currentCorruption = parseInt(this.actor.data.data.corruptionThreshold.value ?? 0);
        console.log(currentCorruption);
        if (element.checked)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    corruptionThreshold: {
                        value: (currentCorruption + 1)
                    }
                }
            });
        }
        else if (currentCorruption > 0)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    corruptionThreshold: {
                        value: (currentCorruption - 1)
                    }
                }
            });
        }
    }

    _setAdvancementProgress(event)
    {
        event.preventDefault();

        const element = event.currentTarget;
        const currentProgress = parseInt(this.actor.data.data.advancement.value ?? 0);
        console.log(currentProgress);
        if (element.checked)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    advancement: {
                        value: (currentProgress + 1)
                    }
                }
            });
        }
        else if (currentProgress > 0)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    advancement: {
                        value: (currentProgress - 1)
                    }
                }
            });
        }
    }
}