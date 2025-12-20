export type Language = 'eng' | 'chn' | 'idn' | 'ara' | 'per' | 'heb' | 'tha' | 'jap' | 'kor';

export interface Translations {
    meta: {
        title: string;
        description: string;
        keywords: string;
    };
    home: {
        partner: string;
        protocol: string;
        protocol_desc: string;
        connect: string;
        infrastructure: string;
        infrastructure_desc: string;
        api_engine: string;
        api_engine_desc: string;
        calendar_accuracy: string;
        apply_api: string;
        footer_text: string;
        date_label: string;
    };
    calendar_names: {
        gregorian: string;
        hijri: string;
        javanese: string;
        chinese: string;
        saka: string;
        balinese: string;
        hebrew: string;
        persian: string;
        buddhist: string;
        mayan: string;
        japanese: string;
        korean: string;
    };
    calendar_descriptions: {
        gregorian: string;
        hijri: string;
        javanese: string;
        chinese: string;
        saka: string;
        balinese: string;
        hebrew: string;
        persian: string;
        buddhist: string;
        mayan: string;
        japanese: string;
        korean: string;
    };
    common: {
        today: string;
        previous_month: string;
        next_month: string;
        previous_day: string;
        next_day: string;
        holiday_cheer: string;
        calendars_viewed: string;
    };
}
