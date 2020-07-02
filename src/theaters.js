const list = {
    strasbourg: 30,
    toulouse: 35,
    caen: 27,
    nantes: 31,
    'nancy-saint-jean': 28,
    'nancy-cite-ludres': 29,
    'lyon-internationale': 32,
    'lyon-confluence': 36,
    'lyon-astoria': 33,
    'lyon-part-dieu': 34,
    lille: 25,
    'villeneuve-d-ascq': 24,
    bordeaux: 1,
    talence: 42,
    'la-defense': 20,
    rosny: 18,
    'o-parinor': 38,
    creteil: 21,
    'noisy-le-grand': 19,
    'cergy-le-haut': 16,
    enghien: 17,
    velizy: 43,
    parly: 44,
    'sqy-ouest': 6,
    roxane: 40,
    cyrano: 41,
    'les-ulis': 23,
    majestic: 39,
    'paris-les-halles': 10,
    'paris-normandie': 2,
    'paris-georges-v': 8,
    'paris-maillot': 7,
    'paris-montparnasse': 14,
    'paris-rotonde': 15,
    'paris-odeon': 13,
    'paris-danton': 4,
    'paris-bercy': 12,
    'paris-lyon-bastille': 11,
    'paris-gobelins': 5,
    'paris-opera': 9,
    'paris-19': 37,
};

export default {
    validate (value) {
        if (value === undefined || value === null) {
            throw new Error('No theater specified, use the UGC_THEATER env var or pass as first script argument');
        }
        let theater;
        if (/^\d+$/.test(value)) {
            theater = parseInt(value, 10);
            if (Object.values(list).indexOf(theater) === -1) {
                throw new Error(`Invalid theater id (${value})`);
            }
        } else {
            theater = list[value.toLowerCase()];
            if (!theater) {
                throw new Error(`Invalid theater key (${value})`);
            }
        }

        return theater;
    },

    getName (value) {
        const names = Object.keys(list);
        const values = Object.values(list);

        const valueIndex = values.indexOf(value);
        if (valueIndex === -1) {
            throw new Error(`Unable to find theater name, invalid theater value ${value}`);
        }

        return names[valueIndex];
    }
}
