(() => {
    currentPageID = "";

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
      const { type, pageID, params } = obj;
  
      if (type === "NEW") {
        currentPageID = pageID;
        console.log("Page initiated: page id: ", currentPageID);
      } else if (type === "TIMER") {
        console.log("content script being hit");
        const matchEl = document.querySelector("div.holes > a[data-value='all']");
        console.log('obj: ', obj);
        if (matchEl) {
            console.log('starting the timer')
            setTimerForRefreshByElement(matchEl, params);
            
        }
      } else if ( type === "CANCEL") {
        console.log('Should cancel the timer')
      }
    });

    const sendTimerToPopup = (times) => {
        chrome.runtime.sendMessage({
            data: times
        }, function (response) {
            console.dir(response);
        });
    }


    const setTimerForRefreshByElement = (element, filterParams) => {
        fetch("https://worldtimeapi.org/api/ip")
        .then(response => response.json())
        .then(data => {
            console.log('world time data: ', data);
            const releaseTime = new Date().setHours(filterParams.releaseTime.hour, filterParams.releaseTime.min, 0);
            const currentTime = new Date(data.datetime).getTime();
            const offsetMillisec = filterParams.offsetMillisec;
            const differenceTime = releaseTime - currentTime - offsetMillisec;
            const timeStart = filterParams.teeTime.start;
            const timeEnd = filterParams.teeTime.end;
            console.log('filterParams: ', filterParams);
            sendTimerToPopup({difference: differenceTime, datetime: data.datetime});
    
            // Refresh tee times after countdown
            // Using fetched world time to calculate 
            setTimeout(() => {
                console.log('countdown is done - click refresh tee times');
                element.click();
                console.log('clicked refresh time: ', new Date().getTime());
                console.log('offset option: ', offsetMillisec);
                // Set interval to check if there are tee times to iterate, once there are, clear interval.
                const checkTeeTimeInterval = setInterval(() => {
                    const container = document.querySelector(".times-inner");
                    const clickableNodes = container.querySelectorAll(".time-tile");
                    const availableTimeNodes = container.querySelectorAll(".booking-start-time-label");
        
                    if (availableTimeNodes.length) {
                        console.log('there are tee times found..., stop the interval: ', new Date());
                        console.log('tee times available : ', availableTimeNodes.length);
                        let timeFound = false;
                        for (let i = 0; i < availableTimeNodes.length; i++) {
                            const nodeValue = availableTimeNodes[i].innerHTML;
                            const nodeTimeConverted = nodeValue.replace(/[ap]/, " $&").toUpperCase();
                            const parts = nodeTimeConverted.match(/(\d+):(\d+) (AM|PM)/);
                            let hours = parseInt(parts[1]);
                            let min = parseInt(parts[2]);
                            let tt = parts[3];
                            if (tt === 'PM' && hours < 12) hours += 12;
                            const currentTeeTimeMilli = new Date().setHours(hours, min, 0);
                            
                            // check if current teeTee is within range // ie 06:00am-06:29am, 06:30am-06:59am
                            if (currentTeeTimeMilli >= timeStart && currentTeeTimeMilli <= timeEnd) {
                                console.log('found a match, use this index: ', i);
                                console.log('corresponding node: ', clickableNodes[i]);
                                timeFound = true;
                                const teeTimeFound = clickableNodes[i];
                                teeTimeFound.click();
                                console.log('clicked tee time (local) at: ', new Date().getTime())
                                break;
                            }
                        }
    
                        if (!timeFound) {
                            console.log('No tee times found within tee time range criteria')
                        }
    
                        clearInterval(checkTeeTimeInterval);
                        return;
                    } else {
                        console.log('no available tee times')
                    }
        
                }, 20)
            }, differenceTime)

        });
    
    }

    // //local time - time set to world clock time
    // const setTimerForRefreshByElement = (element, filterParams) => {

    //     console.log('adjusted clock time to world time: ', new Date());
    //     const releaseTime = new Date().setHours(filterParams.releaseTime.hour, filterParams.releaseTime.min, 0);
    //     const currentTime = new Date().getTime();
    //     const offsetMillisec = filterParams.offsetMillisec;
    //     const differenceTime = releaseTime - currentTime - offsetMillisec;
    //     const timeStart = filterParams.teeTime.start;
    //     const timeEnd = filterParams.teeTime.end;
    //     console.log('filterParams: ', filterParams);
    //     sendTimerToPopup({difference: differenceTime, datetime: new Date()});

    //     // Refresh tee times after countdown
    //     // Using fetched world time to calculate 
    //     setTimeout(() => {
    //         console.log('countdown is done - click refresh tee times');
    //         element.click();
    //         console.log('clicked refresh time: ', new Date().getTime());

    //         // Set interval to check if there are tee times to iterate, once there are, clear interval.
    //         const checkTeeTimeInterval = setInterval(() => {
    //             const container = document.querySelector(".times-inner");
    //             const clickableNodes = container.querySelectorAll(".time-tile");
    //             const availableTimeNodes = container.querySelectorAll(".booking-start-time-label");
    
    //             if (availableTimeNodes.length) {
    //                 console.log('there are tee times found..., stop the interval: ', new Date().getTime());
    //                 let timeFound = false;
    //                 for (let i = 0; i < availableTimeNodes.length; i++) {
    //                     const nodeValue = availableTimeNodes[i].innerHTML;
    //                     const nodeTimeConverted = nodeValue.replace(/[ap]/, " $&").toUpperCase();
    //                     const parts = nodeTimeConverted.match(/(\d+):(\d+) (AM|PM)/);
    //                     let hours = parseInt(parts[1]);
    //                     let min = parseInt(parts[2]);
    //                     let tt = parts[3];
    //                     if (tt === 'PM' && hours < 12) hours += 12;
    //                     const currentTeeTimeMilli = new Date().setHours(hours, min, 0);
                        
    //                     // check if current teeTee is within range // ie 06:00am-06:29am, 06:30am-06:59am
    //                     if (currentTeeTimeMilli >= timeStart && currentTeeTimeMilli <= timeEnd) {
    //                         console.log('found a match, use this index: ', i);
    //                         console.log('corresponding node: ', clickableNodes[i]);
    //                         timeFound = true;
    //                         const teeTimeFound = clickableNodes[i];
    //                         teeTimeFound.click();
    //                         console.log('offset: ', offsetMillisec);
    //                         console.log('clicked tee time (local) at: ', new Date().getTime())
    //                         break;
    //                     }
    //                 }

    //                 if (!timeFound) {
    //                     console.log('No tee times found within tee time range criteria')
    //                 }

    //                 clearInterval(checkTeeTimeInterval);
    //                 return;
    //             } else {
    //                 console.log('no available tee times')
    //             }
    
    //         }, 20)
    //     }, differenceTime)


    
    // }
  
  })();