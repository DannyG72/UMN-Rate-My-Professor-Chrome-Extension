$(document).ready(() => {
  'use strict';
  // Have the sidepanel shown initially
  $('#app-container').addClass('schedule-builder--sidepanel-showing');
  $('#umn-container').addClass('schedule-builder--sidepanel-showing');
  $('#app-header').addClass('schedule-builder--sidepanel-showing');

  collectClassInformationWhenOnClassSpecificPage();

  // Sidepanel html string
  const sidepanel = $(`
    <div id="chromeExtensionSideBar" class="sidepanel shadow-lg">
      <nav class="navbar navbar-expand-lg fixed-top top-bar">
        <a 
          target="_blank" 
          href="https://yelt3d.com/coding-projects/umn-rate-my-professor-chrome-firefox-extension/" 
          class="navbar-brand top-bar__link">
            <img src="${chrome.runtime.getURL(
              'images/icon32.png'
            )}" width="35" height="35" class="d-inline-block align-center logo-img" alt="logo" loading="lazy">
            <span class="top-bar__text">
              RateMyGopher: Schedule Tools
            </span>
        </a>
      </nav>

      <div class="container-fluid">
        <div class="control-buttons mb-4" role="group">
          <button id="searchProfessorButton" type="button" class="btn btn-primary">Search Professors</button>
          <button id="clearListButton" type="button" class="btn btn-primary">Clear List</button>
        </div>

        <div id="resultList"></div>
      </div>

      <nav class="navbar fixed-bottom footer">
        <span class="navbar-text footer__text">
          Developed by
          <strong>
            <a target="_blank" href="https://www.linkedin.com/in/danielglynn72/">
              Daniel Glynn
            </a>
          </strong>
          with
          <strong>
            <a target="_blank" href="https://www.linkedin.com/in/samuel-o-brien-053959196/">
              Samuel O'Brien
            </a>
          </strong>.
        </span>
      </nav>
    </div>
  `)[0];
  document.body.appendChild(sidepanel);

  // Add the toggle button to schedule builder
  const toggleButton = $(`
    <button id="rate-my-gopher-toggle" class="btn-primary toggle-button">Rate My Gopher</button>
  `)[0];
  $('#app-search').append(toggleButton);
  $(toggleButton).on('click', toggleSidebar);

  const resultList = $('#resultList')[0];
  currentProfessors = new Set();

  $('#searchProfessorButton').on('click', () => {
    let returnedToPage = 0;
    let newProfessors = searchProfessors(document.documentElement.outerHTML);

    if (window.location.href.includes('schedulebuilder.umn.edu/schedules')) {
      collectScheduleInformation(currentProfessors, resultList);
    }

    addProfessors(currentProfessors, newProfessors, resultList);

    $(window).focus(() => {
      if (returnedToPage == 0) {
        sleep(1000);
        if (window.location.href.includes('schedulebuilder.umn.edu/schedules')) {
          collectScheduleInformation(currentProfessors, resultList);
        }
        returnedToPage = 1;
      }
    });
  });

  $('#clearListButton').on('click', () => {
    chrome.storage.local.clear(); // Remove previous results
    while (resultList.firstChild) {
      resultList.removeChild(resultList.firstChild);
      currentProfessors = new Set();
    }
  });
});

let cache = {};

let currentProfessors = [];

let observer = new MutationObserver(function (mutations, me) {
  currentWindow = document.location.href;
  let id = 'testObjectChromeExtension';
  if (currentWindow.includes('schedulebuilder.umn.edu/explore')) {
    // alert(currentWindow)
    id = currentWindow.split('/').pop();
  }
  let canvas = document.getElementsByName(id)[0];
  if (canvas) {
    collectClassInformationWhenOnClassSpecificPage();
    me.disconnect(); // stop observing
    return;
  }
});

// start observing
observer.observe(document, {
  childList: true,
  subtree: true,
});

/**
 * Adds new professors to the result list
 * @param {Array[string]} currentProfessors
 * @param {Array[string]} newProfessors
 * @param {Array[string]} resultList
 * @returns {void}
 */
function addProfessors(currentProfessors, newProfessors, resultList) {
  for (const newProf of newProfessors) {
    if (!currentProfessors.has(newProf)) {
      currentProfessors.add(newProf);
      getProfessorInfo(
        newProf,
        (data) => {
          // Function runs if professor is found
          const url = `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${data.id}`;

          const professor = $(`
            <div class="card shadow professor-card">
              <div class="card-body">
                <h4 class="card-title professor-card__title">
                  <a target="_blank" href="${url}">${data.name}</a>
                  <span class="professor-card__close">&times;</span>
                </h4>
                <p class="card-text">
                  Rating: ${data.totalRating} <br>
                  Difficulty Score: ${data.easyScore} <br>
                  Reviews: ${data.numberOfRatings} <br>
                </p>
              </div>
            </div>
          `)[0];

          $(professor)
            .find('.professor-card__close')
            .on('click', () => {
              professor.remove();
              currentProfessors.delete(newProf);
              currentProfessors = new Set();
            });

          resultList.appendChild(professor);
        },
        (name) => {
          // Function runs if professor is not found
          const professor = $(`
            <div class="card shadow-sm professor-card">
              <div class="card-body">
                <h4 class="card-title professor-card__title">
                  <span>${name} (Not Found)</span>
                  <span class="professor-card__close">&times;</span>
                </h4>
              </div>
            </div>
          `)[0];

          $(professor)
            .find('.professor-card__close')
            .on('click', () => {
              professor.remove();
              currentProfessors.delete(newProf);
              currentProfessors = new Set();
            });

          resultList.appendChild(professor);
        }
      );
    }
  }
}

/**
 * Toggles the sidepanel by adding specific classes to it
 */
function toggleSidebar() {
  const sidepanel = $('#chromeExtensionSideBar');
  if (sidepanel.hasClass('sidepanel--hidden')) {
    sidepanel.removeClass('sidepanel--hidden');
    for (const selector of ['#app-container', '#umn-container', '#app-header']) {
      $(selector).addClass('schedule-builder--sidepanel-showing');
    }
    $('#app-header .col-xs-12.affix').css({
      width: 'calc(100vw - var(--sidepanel-width) - 15px)',
      marginRight: 0,
    });
  } else {
    sidepanel.addClass('sidepanel--hidden');
    for (const selector of ['#app-container', '#umn-container', '#app-header']) {
      $(selector).removeClass('schedule-builder--sidepanel-showing');
    }
    $('#app-header .col-xs-12.affix').css({ width: '100%', marginRight: 'auto' });
  }
}

/**
 * Creates a list of the professors in the html string
 * @param {string} string - the html string to find the professor names in
 * @returns {Array[string]} - a string array of the the professors
 */
function searchProfessors(string) {
  let professorList = [];
  let classes = Array.from(string.split('<a href="http://www.umn.edu/lookup?')).map((i) => i);
  for (const c of classes) {
    if (c.includes('type=Internet+ID')) {
      let professorName = c
        .split('type=Internet+ID')[1]
        .split('target="_blank">')[1]
        .split('</a><br>')[0]
        .toLowerCase()
        .replace(' ', '+');
      professorList.push(professorName);
    }
  }
  return [...new Set(professorList)];
}

/**
 * Get the professors information from Rate My Professor and return an object with the data
 * @param {string} name - the name of the profesor's whose info to retrieve (in 'firstname+lastname' format)
 * @param {function} func - a function that takes one argument of the data object to be called when the data is sucessfully retrieved
 * @param {function} errFunc - a function that takes one argument of the professor name to be called if the professor is not found
 * @returns {void}
 */
function getProfessorInfo(name, func, errFunc) {
  if (name in cache) {
    // Use the data in the cache if it was already fetched
    func(cache[name]);
    return;
  }

  const url =
    'https://solr-aws-elb-production.ratemyprofessors.com//solr/rmp/select/?solrformat=true&rows=20&wt=json&json.wrf=noCB&callback=noCB&q=' +
    name +
    '&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+teacherfullname_autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=score+desc&defType=edismax&siteName=rmp&rows=20&group=off&group.field=content_type_s&group.limit=20&fq=schoolname_t%3A%22University+of+Minnesota%5C-Twin+Cities%22&fq=schoolid_s%3A1257';

  // Use the fetch API to get the prof data
  fetch(url)
    .then((response) => response.text())
    .then((responseText) => {
      // Get JSON from the body string
      const responseJSON = JSON.parse(responseText.substring(5, responseText.length - 1));
      const profData = responseJSON.response.docs[0];

      // No Professor was Found
      if (responseJSON.response.docs.length == 0) {
        errFunc(toTitleCase(name.replace('+', ' ')));
        return;
      }

      // Clean the data and call the success function with it
      const cleanedData = {
        id: profData.id.replace('teacher:', ''),
        name: toTitleCase(name.replace('+', ' ')),
        numberOfRatings: profData.total_number_of_ratings_i,
        clarityScore: profData.averageclarityscore_rf,
        easyScore: profData.averageeasyscore_rf,
        helpfulScore: profData.averageheulfulscore_rf,
        hotScore: profData.averagehotscore_rf,
        totalRating: profData.averageratingscore_rf,
        reviews:
          profData.tag_s_mv != undefined
            ? Array.from(profData.tag_s_mv).map((i) => ' ' + i.replace('.', ''))
            : [],
      };
      cache[name] = cleanedData;
      func(cleanedData);
    });
}

function collectScheduleInformation(currentProfessors, resultList) {
  let classesLinkList = findClassesOnSchedulePreviewPage(
    document.getElementById('schedule-courses').outerHTML
  );
  // console.log(classesLinkList)
  let htmlList = [];
  let iterationCount = 0;
  for (let i = 0; i < classesLinkList.length; i++) {
    // console.log('iteration ', i, 'of', classesLinkList.length,':', classesLinkList[i].split('/').pop())

    let continueIteration = false;
    let id = classesLinkList[i].split('/').pop();
    chrome.storage.local.get(classesLinkList[i].split('/').pop(), function (result) {
      let collectClassStatus = result[classesLinkList[i].split('/').pop()];
      // console.log('type of collectClassStatus', typeof(collectClassStatus))
      // console.log('getting value for', classesLinkList[i].split('/').pop())
      try {
        console.log(
          classesLinkList[i].split('/').pop(),
          'Current Collect Status: ',
          collectClassStatus.length
        );
      } catch {
        console.log(
          classesLinkList[i].split('/').pop(),
          'Current Collect Status: ',
          collectClassStatus
        );
      }

      if (collectClassStatus == 'collectInformation' || collectClassStatus == undefined) {
        chrome.storage.local.set(
          { [classesLinkList[i].split('/').pop()]: 'collectInformation' },
          function () {
            // console.log('adding: ', classesLinkList[i].split('/').pop())
            // console.log(classesLinkList[i].split('/').pop()+' Value is set to collectInformation, opening a new tab and grabbing html data for class.');
            window.open(classesLinkList[i]);
            continueIteration = true;
          }
        );
      } else {
        // console.log("not collectInformation nor is it undefined. Perhaps we already have downloaded the data from that page?")
        continueIteration = true;
      }
      htmlList.push(collectClassStatus);
      if (htmlList.length == classesLinkList.length) {
        let htmlList2 = Array.from(htmlList);
        // console.log('htmlList to return: ',htmlList)
        // console.log('classesLinkList: ',classesLinkList)

        for (let i = 0; i < htmlList2.length; i++) {
          // console.log('searching professor from schedule')
          addProfessors(currentProfessors, searchProfessors(htmlList2[i]), resultList);
        }
      }
      return currentProfessors;
    });
  }
}

function collectClassInformationWhenOnClassSpecificPage() {
  console.log('collecting class information');
  currentWindow = document.location.href;
  if (currentWindow[currentWindow.length - 1] == '/') {
    console.log('fixing URL so it has no slash at the end');
    currentWindow = currentWindow.slice(0, -1);
  }
  console.log(currentWindow);
  if (currentWindow.includes('schedulebuilder.umn.edu/explore')) {
    let id = currentWindow.split('/').pop();
    console.log('current id is: ', id);
    chrome.storage.local.get(id, function (result) {
      let collectClassStatus = result[id];
      console.log('Current Collect Status: ');
      if (collectClassStatus == 'collectInformation') {
        let sectionHTML = document.getElementsByName(id)[0].parentNode.outerHTML;
        console.log(sectionHTML);
        chrome.storage.local.set({ [currentWindow.split('/').pop()]: sectionHTML }, function () {
          console.log('updated ID: ', id);
          window.close();
        });
      }
    });
  }
}

function findClassesOnSchedulePreviewPage(string) {
  let matches = document.getElementsByClassName('action-view-section');
  let scheduleBuilderClasses = [];
  originalTableParent = matches[0].parentNode.parentNode.parentNode.parentNode;
  for (i = 0; i < matches.length; i++) {
    newTableParent = matches[i].parentNode.parentNode.parentNode.parentNode;
    if (newTableParent == originalTableParent) {
      scheduleBuilderClasses.push(
        'https://schedulebuilder.umn.edu' + matches[i].getAttribute('href')
      );
    }
  }
  scheduleBuilderClasses = scheduleBuilderClasses.filter((e, i) => i % 2 == 1);
  return scheduleBuilderClasses;
}
