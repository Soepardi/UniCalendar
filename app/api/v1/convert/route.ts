export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { CalendarType, convertDate, CALENDAR_META } from '@/lib/calendars';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    const typeParam = searchParams.get('type');

    if (!dateParam) {
        return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // If type is specified, return just that type
    if (typeParam) {
        if (!CALENDAR_META[typeParam as CalendarType]) {
            return NextResponse.json({ error: 'Invalid calendar type' }, { status: 400 });
        }
        const result = convertDate(date, typeParam as CalendarType);
        return NextResponse.json({ data: result });
    }

    // Otherwise return all supported calendars
    const allResults = Object.keys(CALENDAR_META).map((type) =>
        convertDate(date, type as CalendarType)
    );

    return NextResponse.json({
        meta: {
            sourceDate: date.toISOString(),
            apiVersion: 'v1'
        },
        data: allResults
    });
}
