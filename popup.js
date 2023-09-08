import { getActiveTabURL } from "./utils.js";

const onTimerStart = async e => {
    const activeTab = await getActiveTabURL();
    let form = document.querySelector('#filter-options');
    let formData = new FormData(form);
    const [releaseTimeHour, releaseTimeMin] = formData.get('release-time').split(':');
    const [teeTimeHour, teeTimeMin] = formData.get('tee-time-range').split(':');
    const teeTimeStart = new Date().setHours(parseInt(teeTimeHour), parseInt(teeTimeMin), 0)
    const teeTimeEnd = new Date().setHours(parseInt(teeTimeHour), parseInt(teeTimeMin) + 29, 0);
    const filterParams = {
        players: parseInt(formData.get('players')),
        releaseTime: {
            hour: parseInt(releaseTimeHour),
            min: parseInt(releaseTimeMin)
        },
        teeTime: {
            start: teeTimeStart,
            end: teeTimeEnd
        },
        offsetMillisec: parseInt(formData.get('offset-millisec')) || 0
    }
    console.log('filterParams: ', filterParams);
    chrome.tabs.sendMessage(activeTab.id, {
      type: "TIMER",
      params: filterParams
    });
  };

  const startCountInterval = (timeData) => {
    const timeSpan = document.getElementById('timer');
    const startTimer = timeData.difference;
    const currentTime = new Date(timeData.datetime).getTime();
    const deadline = startTimer + currentTime;
    let currentWorldTime = currentTime;

    // Use fetched world time to mimic real time clock
    const worldTimeInterval = setInterval(() => {
        currentWorldTime = currentWorldTime + 1000;
        console.log('hitting worldTimeInterval')
    }, 1000)

    const countdownInterval = setInterval(() => {
        const distance = deadline - currentWorldTime;
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timeSpan.innerHTML = minutes + 's' + seconds;

        if (minutes <= 0 && seconds <= 0) {
            console.log('interval 2 stopped timer: ', new Date());
            clearInterval(countdownInterval);
            clearInterval(worldTimeInterval);
            timeSpan.innerHTML = "";
        }
    }, 1000)

  }

  document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    if (activeTab.url.includes("foreupsoftware.com")) {
        const element = document.getElementById("timer-btn");
        element.addEventListener("click", onTimerStart);
    } else {
      const container = document.getElementsByClassName("container")[0];
  
      container.innerHTML = '<div class="title">This is not a Bethpage page.</div>';
    }
  });

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log('message: ', message);
    startCountInterval(message.data);
    sendResponse({
        data: "I am fine, thank you. How is life in the background?"
    }); 


});

