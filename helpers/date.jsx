import { format, isToday, isYesterday, parseISO } from 'date-fns';

export const formatMessageDateShort = (date) => {
    if (!date) {
        return ''; // Return an empty string or default value for invalid date
    }

    const modifiedDate = date.replace(" UTC", "Z");

    // Create a Date object
    const inputDate = new Date(modifiedDate);

    if (isToday(inputDate)) {
        return format(inputDate, 'hh:mm a'); // 12-hour format with AM/PM
    } else if (isYesterday(inputDate)) {
        return "Yesterday";
    } else if (inputDate.getFullYear() === new Date().getFullYear()) {
        return format(inputDate, 'dd MMM'); // e.g., "03 Sep"
    } else {
        return format(inputDate, 'dd/MM/yyyy'); // e.g., "03/09/2023"
    }
};
