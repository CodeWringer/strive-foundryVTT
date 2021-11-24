export const ambersteel = {}

ambersteel.weaponTypes = {
    unarmed: "ambersteel.attackTypes.unarmed",
    shortBlade: "ambersteel.attackTypes.shortBlade",
    longBlade: "ambersteel.attackTypes.longBlade",
    greatBlade: "ambersteel.attackTypes.greatBlade",
    axe: "ambersteel.attackTypes.axe",
    greatAxe: "ambersteel.attackTypes.greatAxe",
    spear: "ambersteel.attackTypes.spear",
    lance: "ambersteel.attackTypes.lance",
    polearm: "ambersteel.attackTypes.polearm",
    club: "ambersteel.attackTypes.club",
    smallCrusher: "ambersteel.attackTypes.smallCrusher",
    largeCrusher: "ambersteel.attackTypes.largeCrusher",
    shortBow: "ambersteel.attackTypes.shortBow",
    longBow: "ambersteel.attackTypes.longBow",
    warBow: "ambersteel.attackTypes.warBow",
    crossbow: "ambersteel.attackTypes.crossbow",
    firearm: "ambersteel.attackTypes.firearm"
}

ambersteel.armorTypes = {
    light: "ambersteel.armorTypes.light",
    medium: "ambersteel.armorTypes.medium",
    heavy: "ambersteel.armorTypes.heavy"
}

ambersteel.shieldTypes = {
    buckler: "ambersteel.shieldTypes.buckler",
    roundShield: "ambersteel.shieldTypes.roundShield",
    heaterShield: "ambersteel.shieldTypes.heaterShield",
    kiteShield: "ambersteel.shieldTypes.kiteShield"
}

ambersteel.damageTypes = {
    burning: {
        name: "burning",
        localizableName: "ambersteel.damageTypes.burning",
        localizableAbbreviation: "ambersteel.damageTypes.burningAbbreviation"
    },
    freezing: {
        name: "freezing",
        localizableName: "ambersteel.damageTypes.freezing",
        localizableAbbreviation: "ambersteel.damageTypes.freezingAbbreviation"
    },
    slashing: {
        name: "slashing",
        localizableName: "ambersteel.damageTypes.slashing",
        localizableAbbreviation: "ambersteel.damageTypes.slashingAbbreviation"
    },
    piercing: {
        name: "piercing",
        localizableName: "ambersteel.damageTypes.piercing",
        localizableAbbreviation: "ambersteel.damageTypes.piercingAbbreviation"
    },
    bludgeoning: {
        name: "bludgeoning",
        localizableName: "ambersteel.damageTypes.bludgeoning",
        localizableAbbreviation: "ambersteel.damageTypes.bludgeoningAbbreviation"
    },
    crushing: {
        name: "crushing",
        localizableName: "ambersteel.damageTypes.crushing",
        localizableAbbreviation: "ambersteel.damageTypes.crushingAbbreviation"
    },
    poison: {
        name: "poison",
        localizableName: "ambersteel.damageTypes.poison",
        localizableAbbreviation: "ambersteel.damageTypes.poisonAbbreviation"
    },
    acid: {
        name: "acid",
        localizableName: "ambersteel.damageTypes.acid",
        localizableAbbreviation: "ambersteel.damageTypes.acidAbbreviation"
    },
}

ambersteel.attackTypes = {
    singleTarget: {
        name: "singleTarget",
        localizableName: "ambersteel.attackTypes.singleTarget",
        localizableAbbreviation: "ambersteel.attackTypes.singleTargetAbbreviation"
    },
    areaOfEffect: {
        name: "areaOfEffect",
        localizableName: "ambersteel.attackTypes.areaOfEffect",
        localizableAbbreviation: "ambersteel.attackTypes.areaOfEffectAbbreviation"
    },
    multipleSingleTarget: {
        name: "multipleSingleTarget",
        localizableName: "ambersteel.attackTypes.multipleSingleTarget",
        localizableAbbreviation: "ambersteel.attackTypes.multipleSingleTargetAbbreviation"
    }
}

ambersteel.character = {
    attributeGroups: {
        physical: {
            name: "physical",
            localizableName: "ambersteel.attributeGroups.physical",
            attributes: {
                agility: {
                    name: "agility",
                    localizableName: "ambersteel.attributes.agility",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.agility"
                },
                endurance: {
                    name: "endurance",
                    localizableName: "ambersteel.attributes.endurance",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.endurance"
                },
                perception: {
                    name: "perception",
                    localizableName: "ambersteel.attributes.perception",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.perception"
                },
                strength: {
                    name: "strength",
                    localizableName: "ambersteel.attributes.strength",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.strength"
                },
                toughness: {
                    name: "toughness",
                    localizableName: "ambersteel.attributes.toughness",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.toughness"
                },
            }
        },
        mental: {
            name: "mental",
            localizableName: "ambersteel.attributeGroups.mental",
            attributes: {
                intelligence: {
                    name: "intelligence",
                    localizableName: "ambersteel.attributes.intelligence",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.intelligence"
                },
                wisdom: {
                    name: "wisdom",
                    localizableName: "ambersteel.attributes.wisdom",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.wisdom"
                },
                arcana: {
                    name: "arcana",
                    localizableName: "ambersteel.attributes.arcana",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.arcana"
                },
            }
        },
        social: {
            name: "social",
            localizableName: "ambersteel.attributeGroups.social",
            attributes: {
                empathy: {
                    name: "empathy",
                    localizableName: "ambersteel.attributes.empathy",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.empathy"
                },
                oratory: {
                    name: "oratory",
                    localizableName: "ambersteel.attributes.oratory",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.oratory"
                },
                willpower: {
                    name: "willpower",
                    localizableName: "ambersteel.attributes.willpower",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.willpower"
                },
            }
        }
    },
    biography: {
        origin: "ambersteel.biography.origin",
        youth: "ambersteel.biography.youth",
        lastFewYears: "ambersteel.biography.lastFewYears"
    },
    personals: {
        species: "ambersteel.personals.species",
        culture: "ambersteel.personals.culture",
        sex: "ambersteel.personals.sex",
        age: "ambersteel.personals.age"
    },
    beliefSystem: {
        ambition: "ambersteel.beliefSystem.ambition",
        beliefs: "ambersteel.beliefSystem.beliefs",
        instincts: "ambersteel.beliefSystem.instincts"
    }
}

ambersteel.fateSystem = {
    maxCards: 5
}

ambersteel.visibilityModes = {
    public: "ambersteel.messageVisibilityModes.public",
    self: "ambersteel.messageVisibilityModes.self",
    gm: "ambersteel.messageVisibilityModes.gm"
}