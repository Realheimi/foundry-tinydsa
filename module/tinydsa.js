import { tinydsa } from "./config.js";
import tinydsaItemSheet from "./sheets/tinydsaItemSheet.js";
import tinydsaHeroSheet from "./sheets/tinydsaHeroSheet.js";
import tinydsaNpcSheet from "./sheets/tinydsaNpcSheet.js";
import DieRoll from "./applications/DieRoll.js";
import { localizeAll } from "./helpers/utils.js";
import { diceToFaces } from "./helpers/dice.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/tinydsa/templates/partials/trait-block.hbs",
        "systems/tinydsa/templates/partials/roll-bar.hbs",
        "systems/tinydsa/templates/partials/inventory-card.hbs"
    ];

    return loadTemplates(templatePaths);
};

async function displayFloatingDieRollApplication() {
    new DieRoll(DieRoll.defaultOptions, { excludeTextLabels: true }).render(true);
}

function registerGameSettings()
{
    game.settings.register("tinydsa", "theme", {
        name: game.i18n.localize("tinydsa.settings.theme.name"),
        hint:  game.i18n.localize("tinydsa.settings.theme.hint"),
        scope: "world",
        config: false,
        choices: localizeAll(CONFIG.tinydsa.themes),
        default: "tiny-cthulhu",
        type: String
    });

    game.settings.register("tinydsa", "enableCorruption", {
        name: game.i18n.localize("tinydsa.settings.enableCorruption.name"),
        hint:  game.i18n.localize("tinydsa.settings.enableCorruption.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("tinydsa", "enableAdvancement", {
        name: game.i18n.localize("tinydsa.settings.enableAdvancement.name"),
        hint:  game.i18n.localize("tinydsa.settings.enableAdvancement.hint"),
        scope: "world",
        config: true,
        choices: localizeAll(CONFIG.tinydsa.advancementMethods),
        default: "none",
        type: String
    });

    game.settings.register("tinydsa", "enableItemTracking", {
        name: game.i18n.localize("tinydsa.settings.enableItemTracking.name"),
        hint:  game.i18n.localize("tinydsa.settings.enableItemTracking.hint"),
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.register("tinydsa", "enableDepletionPoints", {
        name: game.i18n.localize("tinydsa.settings.enableDepletionPoints.name"),
        hint:  game.i18n.localize("tinydsa.settings.enableDepletionPoints.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("tinydsa", "enableVariableWeaponDamage", {
        name: game.i18n.localize("tinydsa.settings.enableVariableWeaponDamage.name"),
        hint:  game.i18n.localize("tinydsa.settings.enableVariableWeaponDamage.hint"),
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.register("tinydsa", "enableCriticalHits", {
        name: game.i18n.localize("tinydsa.settings.enableCriticalHits.name"),
        hint:  game.i18n.localize("tinydsa.settings.enableCriticalHits.hint"),
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.register("tinydsa", "enableDamageReduction", {
        name: game.i18n.localize("tinydsa.settings.enableDamageReduction.name"),
        hint:  game.i18n.localize("tinydsa.settings.enableDamageReduction.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("tinydsa", "threshold", {
        scope: "world",
        config: false,
        default: 5,
        type: Number
    });
}

Hooks.once("init", () => {
    console.log("tinydsa | Initializing Tiny D6 system");

    CONFIG.tinydsa = tinydsa;
    // CONFIG.debug.hooks = true;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("tinydsa", tinydsaHeroSheet, { makeDefault: true, types: ["hero"] });
    Actors.registerSheet("tinydsa", tinydsaNpcSheet, { types: ["npc"] });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("tinydsa", tinydsaItemSheet, { makeDefault: true });

    registerGameSettings();
    preloadHandlebarsTemplates();

    Handlebars.registerHelper("times", function(n, content)
    {
        let result = "";
        for (let i = 0; i < n; ++i)
        {
            result += content.fn(i);
        }

        return result;
    });

    Handlebars.registerHelper("face", diceToFaces);
});

Hooks.once("setup", event => {
    displayFloatingDieRollApplication();
});

/* TODO: Move the floating roll bar logic to this new hotbar element and style it
 *
Hooks.once("ready", event => {
    let basedoc = document.getElementsByClassName("vtt game system-tinydsa");

    let hotbar = document.createElement("DIV");
    hotbar.className = "dcroll-bar";

    basedoc[0].appendChild(hotbar);

    let backgr = document.createElement("DIV");
    backgr.className = "dc-input";

    let header = document.createElement("DIV");
    header.className = "dc-header";
    header.textContent = "DC";

    let form = document.createElement("FORM");
    let sInput = document.createElement("INPUT");
    sInput.className = "dcinput-box";
    sInput.setAttribute("type", "text");
    sInput.setAttribute("name", "dc");
    sInput.setAttribute("value", "");

    let initvalue = 0;
    if(!hasProperty(tinydsa.threshold, game.data.world.name))
    {
        setProperty(tinydsa.threshold, game.data.world.name, 0);
    }

    sInput.value = game.settings.get("tinydsa", "threshold");

    sInput.addEventListener("keydown", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if(event.key === "Backspace" || event.key === "Delete"){
            sInput.value = 0;
        }

        else if(event.key === "Enter"){
            //SBOX.diff[game.data.world.name] = sInput.value;
            await game.settings.set("tinydsa", "threshold", sInput.value);
        }

        else if(event.key === "-"){
            //SBOX.diff[game.data.world.name] = sInput.value;
            sInput.value = "-";
        }

        else{
            if(!isNaN(event.key))
                sInput.value += event.key;
        }

        if(!isNaN(sInput.value)){
            sInput.value = parseInt(sInput.value);
        }


    });

    sInput.addEventListener("focusout", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        //SBOX.diff[game.data.world.name] = sInput.value;
        await game.settings.set("tinydsa", "threshold", sInput.value);

    });

    form.appendChild(sInput);
    backgr.appendChild(header);

    backgr.appendChild(form);

    hotbar.appendChild(backgr);
    console.log(hotbar);
});
*/

Hooks.on("createOwnedItem", (actor, item) => {
    console.log("tinydsa | handling owned item");

    if (item.type === "heritage")
    {
        actor.update({
            _id: actor._id,
            data: {
                wounds: {
                    max: item.data.startingHealth
                },
                corruptionThreshold: {
                    max: item.data.corruptionThreshold
                }
            }
        });
    }
});
