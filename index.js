const URL = "https://localhost:3000/tweets";

let nextPageUrl = null;

const onEnter = (e) => {
  if (e.key == "Enter") {
    getTwitterData();
  }
};

const onNextPage = () => {
  if (nextPageUrl) {
    let loaderBottom = `<div id="spinner-bottom" class="show"></div>`;
    document.querySelector(".next-page-container").innerHTML = loaderBottom;
    getTwitterData(true);
  }
};

/**
 * Retrive Twitter Data from API
 */
const getTwitterData = (nextPage = false) => {
  const query = document.getElementById("user-search-input").value;
  if (!query) return;
  const encodedQuery = encodeURIComponent(query);
  let fullUrl = `${URL}?q=${encodedQuery}&count=10`;
  if (nextPage && nextPageUrl) {
    fullUrl = nextPageUrl;
  } else {
    let loader = `<div id="spinner" class="show"></div>`;
    document.querySelector(".tweet-list").innerHTML = loader;
  }
  try {
    fetch(fullUrl)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        buildTweets(data.statuses, nextPage);
        saveNextPage(data.search_metadata);
        nextPageButtonVisibility(data.search_metadata);
      });
  } catch (e) {
    alert("Oh! Can't find tweets. Try again later");
  }
};

/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
  if (metadata.next_results) {
    nextPageUrl = `${URL}${metadata.next_results}`;
  } else {
    nextPageUrl = null;
  }
};

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (e) => {
  const text = e.innerText;
  document.getElementById("user-search-input").value = text;
  getTwitterData();
};

/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
  if (metadata.next_results) {
    const bottomArrow = `<i class="fas fa-arrow-down"></i>`;
    document.getElementById("next-page").style.visibility = "visible";
    document.getElementById("spinner-bottom").style.visibility = "hidden";
    document.getElementById("next-page").innerHTML = bottomArrow;
  } else {
    document.getElementById("next-page").style.visibility = "hidden";
  }
};

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, nextPage) => {
  let twitterContent = "";
  tweets.map((tweet) => {
    const createdDate = moment(tweet.created_at).fromNow();
    twitterContent += `
          <div class="tweet-container">
            <div class="tweet-user-info">
                <div class="tweet-user-profile" style="background-image: url(${tweet.user.profile_image_url_https})">
                </div>
                <div class="tweet-name-container">
                    <div class="tweet-user-fullname">${tweet.user.name}</div>
                    <div class="tweet-user-username">@${tweet.user.screen_name}</div>
                </div>
            </div>
            `;
    if (tweet.extended_entities && tweet.extended_entities.media.length > 0) {
      twitterContent += buildImages(tweet.extended_entities.media);
      twitterContent += buildVideo(tweet.extended_entities.media);
    }
    twitterContent += `
            <div class="tweet-text-container">
                ${tweet.full_text}
            </div>
            <div class="tweet-date-container">
                ${createdDate}
            </div>
        </div>
`;
  });
  if (nextPage) {
    document
      .querySelector(".tweet-list")
      .insertAdjacentHTML("beforeend", twitterContent);
  } else {
    document.querySelector(".tweet-list").innerHTML = twitterContent;
  }
};

/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
  imageContent = `<div class="tweet-images-container">`;
  let imageExist = false;
  mediaList.map((media) => {
    if (media.type == "photo") {
      imageExist = true;
      imageContent += `<div class="tweet-image" style="background-image: url(${media.media_url_https})"></div>`;
    }
  });
  imageContent += "</div>";
  return imageExist ? imageContent : "";
};

/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
  videoContent = `<div class="tweet-video-container">`;
  let videoExist = false;
  mediaList.map((media) => {
    if (media.type == "video") {
      videoExist = true;
      const videoVariants = media.video_info.variants.find(
        (variant) => variant.content_type == "video/mp4"
      );
      videoContent += `
        <video controls>
            <source src="${videoVariants.url}" type="video/mp4">
        </video>
      `;
    } else if (media.type == "animated_gif") {
      videoExist = true;
      const videoVariants = media.video_info.variants.find(
        (variant) => variant.content_type == "video/mp4"
      );
      videoContent += `
        <video loop autoplay>
            <source src="${videoVariants.url}" type="video/mp4">
        </video>
      `;
    }
  });
  videoContent += "</div>";
  return videoExist ? videoContent : "";
};
