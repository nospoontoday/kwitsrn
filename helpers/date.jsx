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

export const formatMessageDateLong = (date) => {
    const now = new Date();
    const inputDate = new Date(date);

    if(isToday(inputDate)) {
        return inputDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    } else if (isYesterday(inputDate)) {
        return (
            "Yesterday " +
            inputDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
        )
    } else if (inputDate.getFullYear() === now.getFullYear()) {
        return inputDate.toLocaleDateString([], {
            day: "2-digit",
            month: "short",
        });
    } else {
        return inputDate.toLocaleDateString();
    }
}
