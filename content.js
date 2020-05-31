$(document).ready(function () {
  'use strict';

  collectClassInformationWhenOnClassSpecificPage();

  document.body.style.width = '80%';

  let rightSide = document.createElement('div');
  rightSide.className = 'sideBar';
  rightSide.id = 'chromeExtensionSideBar';
  document.body.appendChild(rightSide);

  let topBar = document.createElement('div');
  topBar.textAlign = 'center';
  topBar.className = 'topBar';
  rightSide.appendChild(topBar);

  let toggleBoxHide = document.createElement('div');
  toggleBoxHide.textAlign = 'center';
  toggleBoxHide.className = 'toggleBoxHide';
  toggleBoxHide.id = 'chromeExtensionHideButton';
  document.body.appendChild(toggleBoxHide);

  let hideText = toggleBoxHide.appendChild(document.createElement('span'));
  hideText.innerHTML = 'Hide';
  hideText.style.color = '#FFCC33';
  hideText.style.cursor = 'pointer';
  hideText.style.textAlign = 'center';
  hideText.style.margin = 'auto';
  hideText.style.writingMode = 'vertical-rl';
  hideText.style.fontWeight = 'bold';
  hideText.style.fontSize = 'medium';
  hideText.style.marginTop = '14px';
  hideText.onclick = function () {
    hideSideBar();
  };

  let toggleBoxShow = document.createElement('div');
  toggleBoxShow.textAlign = 'center';
  toggleBoxShow.className = 'toggleBoxShow';
  toggleBoxShow.style.display = 'none';
  toggleBoxShow.id = 'chromeExtensionShowButton';
  document.body.appendChild(toggleBoxShow);

  let showText = toggleBoxShow.appendChild(document.createElement('span'));
  showText.innerHTML = 'Show';
  showText.style.color = '#FFCC33';
  showText.style.cursor = 'pointer';
  showText.style.textAlign = 'center';
  showText.style.margin = 'auto';
  showText.style.writingMode = 'vertical-rl';
  showText.style.fontWeight = 'bold';
  showText.style.fontSize = 'medium';
  showText.style.marginTop = '14px';
  showText.onclick = function () {
    showSideBar();
  };

  let topBarText = document.createElement('span');
  topBarText.width = '400px';
  topBarText.display = 'inline-block';
  topBarText.style.marginTop = '10px';
  topBarText.style.fontWeight = 'bold';
  topBarText.style.fontSize = 'x-large';
  topBarText.style.maxLines = '2';

  let RateMyGopherURL =
    'https://yelt3d.com/coding-projects/umn-rate-my-professor-chrome-firefox-extension/';
  let RateMyGopherBold = document.createElement('strong');
  let RateMyGopherLink = document.createElement('a');
  RateMyGopherLink.href = RateMyGopherURL;
  RateMyGopherLink.target = '_blank';
  RateMyGopherLink.innerText = 'RateMyGopher: Schedule Tools';
  RateMyGopherLink.style.color = '#FFCC33';
  RateMyGopherLink.style.maxLines = '2';
  RateMyGopherBold.appendChild(RateMyGopherLink);
  topBarText.appendChild(RateMyGopherBold);

  topBar.appendChild(topBarText);

  let credits = document.createElement('div');
  credits.className = 'credits';
  rightSide.appendChild(credits);

  let dannyURL = 'https://www.linkedin.com/in/danielglynn72/';
  let dannyBold = document.createElement('strong');
  let dannyLink = document.createElement('a');
  dannyLink.href = dannyURL;
  dannyLink.target = '_blank';
  dannyLink.innerText = 'Daniel Glynn';
  dannyBold.appendChild(dannyLink);

  let samURL = 'https://www.linkedin.com/in/samuel-o-brien-053959196/';
  let samBold = document.createElement('strong');
  let samLink = document.createElement('a');
  samLink.href = samURL;
  samLink.target = '_blank';
  samLink.innerText = "Samuel O'Brien";
  samBold.appendChild(samLink);

  let creditText = document.createElement('span');
  creditText.style.margin = '4px';
  creditText.style.color = '#fff';
  creditText.style.fontSize = 'x-small';
  creditText.appendChild(document.createTextNode('Developed By '));
  creditText.appendChild(dannyBold);
  creditText.appendChild(document.createTextNode(' with '));
  creditText.appendChild(samBold);
  creditText.appendChild(document.createTextNode('.'));
  credits.appendChild(creditText);

  let resultList = document.createElement('span');

  currentProfessors = new Set();
  let searchProfessor = document.createElement('Button');
  rightSide.appendChild(searchProfessor);
  searchProfessor.id = 'searchProfessorButton';
  searchProfessor.innerHTML = 'Search Professors';
  searchProfessor.className = 'custom-button-for-stuff';
  searchProfessor.style.width = '250px';
  searchProfessor.style.marginTop = '74px';

  searchProfessor.addEventListener('click', function () {
    let returnedToPage = 0;
    let newProfessors = searchProfessors(document.documentElement.outerHTML);
    if (window.location.href.includes('schedulebuilder.umn.edu/schedules')) {
      collectScheduleInformation(currentProfessors, resultList);
    }
    addProfessors(currentProfessors, newProfessors, resultList);
    $(window).focus(function () {
      if (returnedToPage == 0) {
        sleep(1000);
        if (window.location.href.includes('schedulebuilder.umn.edu/schedules')) {
          collectScheduleInformation(currentProfessors, resultList);
        }
        returnedToPage = 1;
      }
    });
  });
  let clearList = document.createElement('Button');
  clearList.id = 'clearListButton';
  clearList.innerHTML = 'Clear List';
  clearList.className = 'custom-button-for-stuff';
  clearList.style.width = '250px';
  clearList.addEventListener('click', function () {
    chrome.storage.local.clear(); // Remove previous results
    while (resultList.firstChild) {
      resultList.removeChild(resultList.firstChild);
      currentProfessors = new Set();
    }
  });
  rightSide.appendChild(clearList);
  rightSide.appendChild(resultList);
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

function addProfessors(currentProfessors, newProfessors, resultList) {
  console.log('currentProfessors:', currentProfessors);
  console.log('newprofessors:', newProfessors);
  for (let i = 0; i < newProfessors.length; i++) {
    if (currentProfessors.has(newProfessors[i])) {
      console.log('Skipping ' + newProfessors[i]);
    } else {
      currentProfessors.add(newProfessors[i]);
      console.log('Adding ' + newProfessors[i]);
      console.log(currentProfessors);
      getProfessorInfo(
        newProfessors[i],
        function (data) {
          // Function runs if professor is found
          let url = 'https://www.ratemyprofessors.com/ShowRatings.jsp?tid=' + data.id;

          let bold = document.createElement('strong');
          let a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.innerText = data.name;
          bold.appendChild(a);

          let professor = document.createElement('span');
          professor.appendChild(bold);
          professor.appendChild(document.createTextNode(' (' + data.numberOfRatings + ' Reviews)'));
          let spanText = professor.appendChild(document.createElement('span'));
          spanText.innerHTML = ' (Remove)\n';
          spanText.style.color = 'Red';
          spanText.style.cursor = 'pointer';
          spanText.onclick = function () {
            professor.remove();
            console.log(currentProfessors);
            currentProfessors.delete(newProfessors[i]);
            currentProfessors = new Set();
          };
          professor.appendChild(document.createElement('br'));
          if (data.numberOfRatings > 0) {
            professor.appendChild(document.createTextNode('Rating: ' + data.totalRating));
            professor.appendChild(document.createElement('br'));
            professor.appendChild(document.createTextNode('Difficulty Score: ' + data.easyScore));
            professor.appendChild(document.createElement('br'));
            if (data.reviews.length > 1) {
              professor.appendChild(document.createTextNode('Reviews: ' + data.reviews + '\n'));
              professor.appendChild(document.createElement('br'));
            }
          } else {
          }
          professor.appendChild(document.createElement('br'));
          // professor.appendChild(document.createElement('br'));
          resultList.appendChild(professor);
        },
        function (name) {
          // function runs if professor is not found
          let professor = document.createElement('p');
          let bold = document.createElement('strong');
          bold.innerText = name;
          professor.appendChild(bold);
          professor.appendChild(document.createTextNode(' (Not Found)'));
          let spanText = professor.appendChild(document.createElement('span'));
          spanText.innerHTML = ' (Remove)\n';
          spanText.style.color = 'Red';
          spanText.style.cursor = 'pointer';
          spanText.onclick = function () {
            professor.remove();
            currentProfessors.delete(newProfessors[i]);
            currentProfessors = new Set();
          };
          resultList.appendChild(professor);
        }
      );
    }
  }
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

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function getProfessorInfo(name, func, errFunc) {
  if (name in cache) {
    func(cache[name]);
  } else {
    const apiUrl =
      'https://solr-aws-elb-production.ratemyprofessors.com//solr/rmp/select/?solrformat=true&rows=20&wt=json&json.wrf=noCB&callback=noCB&q=' +
      name +
      '&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+teacherfullname_autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=score+desc&defType=edismax&siteName=rmp&rows=20&group=off&group.field=content_type_s&group.limit=20&fq=schoolname_t%3A%22University+of+Minnesota%5C-Twin+Cities%22&fq=schoolid_s%3A1257';
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', apiUrl);
    xhttp.send();
    xhttp.onload = function (e) {
      let jsonResponse = JSON.parse(this.responseText.substring(5, this.responseText.length - 1));
      console.log(jsonResponse);

      // No Professor was Found
      if (jsonResponse.response.docs.length == 0) {
        errFunc(toTitleCase(name.replace('+', ' ')));
        return;
      }

      let data = {
        id: jsonResponse.response.docs[0].id.replace('teacher:', ''),
        name: toTitleCase(name.replace('+', ' ')),
        numberOfRatings: jsonResponse.response.docs[0].total_number_of_ratings_i,
        clarityScore: jsonResponse.response.docs[0].averageclarityscore_rf,
        easyScore: jsonResponse.response.docs[0].averageeasyscore_rf,
        helpfulScore: jsonResponse.response.docs[0].averageheulfulscore_rf,
        hotScore: jsonResponse.response.docs[0].averagehotscore_rf,
        totalRating: jsonResponse.response.docs[0].averageratingscore_rf,
        reviews:
          jsonResponse.response.docs[0].tag_s_mv != undefined
            ? Array.from(jsonResponse.response.docs[0].tag_s_mv).map(
                (i) => ' ' + i.replace('.', '')
              )
            : [],
      };
      cache[name] = data;
      func(data);
    };
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

function hideSideBar() {
  document.getElementById('chromeExtensionSideBar').style.display = 'none';
  document.getElementById('chromeExtensionHideButton').style.display = 'none';
  document.getElementById('chromeExtensionShowButton').style.display = 'block';
  document.getElementById('chromeExtensionHideButton').style.display = 'none';
  document.body.style.width = '100%';
}

function showSideBar() {
  document.getElementById('chromeExtensionSideBar').style.display = 'block';
  document.getElementById('chromeExtensionHideButton').style.display = 'block';
  document.getElementById('chromeExtensionShowButton').style.display = 'none';
  document.getElementById('chromeExtensionHideButton').style.display = 'block';
  document.body.style.width = '80%';
}

function searchProfessors(string) {
  console.log('searchingForProfessors');
  let professorList = [];
  let classes = Array.from(string.split('<a href="http://www.umn.edu/lookup?')).map((i) => i);
  for (let i = 0; i < classes.length; i++) {
    let classObj = classes[i];
    // let classObjHTML = classObj.innerHTML;
    if (classes[i].includes('type=Internet+ID')) {
      let professorName = classes[i]
        .split('type=Internet+ID')[1]
        .split('target="_blank">')[1]
        .split('</a><br>')[0]
        .toLowerCase()
        .replace(' ', '+');
      professorList.push(professorName);
    }
  }
  let professors = [...new Set(professorList)];
  console.log(professors);
  return professors;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
