export const tinydsa = {};

tinydsa.systemLogo = "systems/tinydsa/assets/images/tiny-d6-logo.webp";
tinydsa.theme = "tiny-cthulhu";
tinydsa.defaultItemImage = "icons/svg/mystery-man.svg";
tinydsa.threshold = {};

tinydsa.weaponTypes = {
    none: "",
    light: "tinydsa.weaponTypes.light",
    heavy: "tinydsa.weaponTypes.heavy"
}

tinydsa.themes = {
    "tiny-cthulhu": "tinydsa.settings.theme.choices.cthulhu",
    "tiny-dungeon": "tinydsa.settings.theme.choices.dungeon"
}

tinydsa.advancementMethods = {
    "none": "tinydsa.settings.enableAdvancement.choices.none",
    "minimalist": "tinydsa.settings.enableAdvancement.choices.minimalist",
    "xp": "tinydsa.settings.enableAdvancement.choices.xp"
}

tinydsa.weaponCategories = {
    none: "",
    melee: "tinydsa.weaponCategories.melee",
    ranged: "tinydsa.weaponCategories.ranged"
}

tinydsa.armorTypes = {
    none: "",
    light: "tinydsa.armorTypes.light",
    medium: "tinydsa.armorTypes.medium",
    heavy: "tinydsa.armorTypes.heavy"
}

tinydsa.corruptionTests = {
    none: "tinydsa.corruptionTests.none",
    disadvantage: "tinydsa.corruptionTests.disadvantage",
    standard: "tinydsa.corruptionTests.standard"
}
