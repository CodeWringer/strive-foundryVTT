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
    burning: "ambersteel.damageTypes.burning",
    freezing: "ambersteel.damageTypes.freezing",
    slashing: "ambersteel.damageTypes.slashing",
    piercing: "ambersteel.damageTypes.piercing",
    bludgeoning: "ambersteel.damageTypes.bludgeoning",
    crushing: "ambersteel.damageTypes.crushing",
    poison: "ambersteel.damageTypes.poison",
    acid: "ambersteel.damageTypes.acid",
}

ambersteel.attackTypes = {
    singleTarget: "ambersteel.attackTypes.singleTarget",
    areaOfEffect: "ambersteel.attackTypes.areaOfEffect",
    multipleSingleTarget: "ambersteel.attackTypes.multipleSingleTarget",
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
        },
        arcane: {
            name: "arcane",
            localizableName: "ambersteel.attributeGroups.arcane",
            attributes: {
                arcana: {
                    name: "arcana",
                    localizableName: "ambersteel.attributes.arcana",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.arcana"
                },
                magicSense: {
                    name: "magicSense",
                    localizableName: "ambersteel.attributes.magicSense",
                    localizableAbbreviation: "ambersteel.attributeAbbreviations.magicSense"
                }
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

ambersteel.character.attributes = {
    agility: ambersteel.character.attributeGroups.physical.attributes.agility,
    endurance: ambersteel.character.attributeGroups.physical.attributes.endurance,
    perception: ambersteel.character.attributeGroups.physical.attributes.perception,
    strength: ambersteel.character.attributeGroups.physical.attributes.strength,
    toughness: ambersteel.character.attributeGroups.physical.attributes.toughness,
    intelligence: ambersteel.character.attributeGroups.mental.attributes.intelligence,
    wisdom: ambersteel.character.attributeGroups.mental.attributes.wisdom,
    empathy: ambersteel.character.attributeGroups.social.attributes.empathy,
    oratory: ambersteel.character.attributeGroups.social.attributes.oratory,
    willpower: ambersteel.character.attributeGroups.social.attributes.willpower,
    arcana: ambersteel.character.attributeGroups.arcane.attributes.arcana,
    magicSense: ambersteel.character.attributeGroups.arcane.attributes.magicSense
}

ambersteel.fateSystem = {
    maxCards: 5
}

ambersteel.visibilityModes = {
    public: "ambersteel.messageVisibilityModes.public",
    self: "ambersteel.messageVisibilityModes.self",
    gm: "ambersteel.messageVisibilityModes.gm"
}