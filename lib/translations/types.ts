export type Language = 'eng' | 'chn' | 'idn' | 'ara' | 'per' | 'heb' | 'tha' | 'jap' | 'kor';

export interface Translations {
    meta: {
        title: string;
        description: string;
        keywords: string;
    };
    home: {
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
        buy_me_coffee: string;
        view_mode_day: string;
        view_mode_month: string;
        native_script: string;
        export: string;
        processing: string;
    };
}
