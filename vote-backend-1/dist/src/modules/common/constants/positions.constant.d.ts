export declare const POSITIONS: {
    readonly PRESIDENT: "PRESIDENT";
    readonly VICE_PRESIDENT: "VICE_PRESIDENT";
    readonly GENERAL_SECRETARY: "GENERAL_SECRETARY";
    readonly FINANCIAL_SECRETARY: "FINANCIAL_SECRETARY";
    readonly ORGANIZING_SECRETARY: "ORGANIZING_SECRETARY";
    readonly ORGANIZING_SECRETARY_ASST: "ORGANIZING_SECRETARY_ASST";
    readonly PRO_MAIN: "PRO_MAIN";
    readonly PRO_ASST: "PRO_ASST";
    readonly WOMENS_COMMISSIONER: "WOMENS_COMMISSIONER";
};
export declare const POSITION_REQUIREMENTS: {
    PRESIDENT: {
        minLevel: number;
        maxLevel: number;
        description: string;
    };
    VICE_PRESIDENT: {
        minLevel: number;
        maxLevel: number;
        description: string;
    };
    GENERAL_SECRETARY: {
        minLevel: number;
        maxLevel: number;
        description: string;
    };
    ORGANIZING_SECRETARY: {
        minLevel: number;
        maxLevel: number;
        description: string;
    };
    ORGANIZING_SECRETARY_ASST: {
        minLevel: number;
        maxLevel: number;
        description: string;
    };
    FINANCIAL_SECRETARY: {
        minLevel: number;
        maxLevel: number;
        description: string;
    };
    PRO_MAIN: {
        minLevel: number;
        maxLevel: number;
        description: string;
    };
    PRO_ASST: {
        minLevel: number;
        maxLevel: number;
        description: string;
    };
    WOMENS_COMMISSIONER: {
        minLevel: number;
        maxLevel: number;
        description: string;
    };
};
export declare const VOTING_ORDER: ("PRESIDENT" | "VICE_PRESIDENT" | "FINANCIAL_SECRETARY" | "ORGANIZING_SECRETARY_ASST" | "PRO_MAIN" | "GENERAL_SECRETARY" | "ORGANIZING_SECRETARY" | "PRO_ASST" | "WOMENS_COMMISSIONER")[];
