export const POSITIONS = {
    PRESIDENT: 'PRESIDENT',
    VICE_PRESIDENT: 'VICE_PRESIDENT',
    GENERAL_SECRETARY: 'GENERAL_SECRETARY',
    FINANCIAL_SECRETARY: 'FINANCIAL_SECRETARY',
    ORGANIZING_SECRETARY: 'ORGANIZING_SECRETARY',
    ORGANIZING_SECRETARY_ASST: 'ORGANIZING_SECRETARY_ASST',
    PRO_MAIN: 'PRO_MAIN',
    PRO_ASST: 'PRO_ASST',
    WOMENS_COMMISSIONER: 'WOMENS_COMMISSIONER',
} as const;


export const POSITION_REQUIREMENTS = {
    [POSITIONS.PRESIDENT]: {
        minLevel: 200,
        maxLevel: 300,
        description: 'Chief Executive Officer of Pax Romana KNUST',
    },
    [POSITIONS.VICE_PRESIDENT]: {
        minLevel: 200,
        maxLevel: 300,
        description: 'Deputy to the President',
    },
    [POSITIONS.GENERAL_SECRETARY]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Secretary to the President',
    },
    [POSITIONS.ORGANIZING_SECRETARY]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Organize Pax Activities',
    },
    [POSITIONS.ORGANIZING_SECRETARY_ASST]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Assist in organizing Pax Activities',
    },
    [POSITIONS.FINANCIAL_SECRETARY]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Financial Officer of Pax Activities',
    },
    [POSITIONS.PRO_MAIN]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Promotional Officer of Pax Activities',
    },
    [POSITIONS.PRO_ASST]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Assist in promoting Pax Activities',
    },
    [POSITIONS.WOMENS_COMMISSIONER]: {
        minLevel: 100,
        maxLevel: 300,
        description: 'Representative of Pax Ladies',
    }
};

export const VOTING_ORDER = [
    POSITIONS.PRESIDENT,
    POSITIONS.VICE_PRESIDENT,
    POSITIONS.GENERAL_SECRETARY,
    POSITIONS.FINANCIAL_SECRETARY,
    POSITIONS.ORGANIZING_SECRETARY,
    POSITIONS.ORGANIZING_SECRETARY_ASST,
    POSITIONS.PRO_MAIN,
    POSITIONS.PRO_ASST,
    POSITIONS.WOMENS_COMMISSIONER
];