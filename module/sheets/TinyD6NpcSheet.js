import tinydsaActorSheet from "./tinydsaActorSheet.js";

export default class tinydsaNpcSheet extends tinydsaActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            height: null,
            template: "systems/tinydsa/templates/sheets/npc-sheet.hbs",
            classes: [ "tinydsa", "sheet", "npc", game.settings.get("tinydsa", "theme") ]
        });
    }
}