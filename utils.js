export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

export function convert12HrTimeToDateString(time12Hr) {
    var time = time12Hr;
    var startTime = new Date();
    var parts = time.match(/(\d+):(\d+) (AM|PM)/);
    if (parts) {
        var hours = parseInt(parts[1]),
            minutes = parseInt(parts[2]),
            tt = parts[3];
        if (tt === 'PM' && hours < 12) hours += 12;
        console.log('hours: ', hours);
        startTime.setHours(hours, minutes, 0, 0);
    }
    return startTime;
}