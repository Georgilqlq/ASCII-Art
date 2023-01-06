var options_form = document.getElementById('video-options');
var new_frame_button = document.getElementById('new-frame');
var remove_frame_button = document.getElementById('remove-frame');
var make_video = document.getElementById('make-video');
var stop_video;
var number_of_frames = 1;
var times = document.getElementsByClassName("times");
var buttonToggleTime = document.getElementsByClassName("time-btn")[0];
const TEXT_ROWS = 10;
const TEXT_COLLS = 10;
var loaded_videos = [];

var modal = document.getElementById("modal");
// modal.style.display = "none";
var modalContent = document.getElementsByClassName("modal-body")[0]
var modalCloseBtn = document.getElementsByClassName("close")[0];

function modalFunctionality() {

    modalCloseBtn.onclick = function () {
        console.log("AA");
        modal.style.display = "none";
        document.getElementsByClassName("sections")[0].classList.remove("show-modal");
        // window.location.reload();
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.getElementsByClassName("sections")[0].classList.remove("show-modal");
            // window.location.reload();
        }
    }
}

function showModalForSeconds(reload = false) {
    document.getElementsByClassName("sections")[0].classList.add("show-modal");
    modal.style.display = "block";
    setTimeout(() => {
        document.getElementsByClassName("sections")[0].classList.remove("show-modal");
        modal.style.display = "none";
        // if (reload) {
        //     window.location.reload();
        // }
    }, 2000);
}



class Options {


    constructor(title, time, color, background) {
        this.title = title;
        this.time = time;
        this.color = color;
        this.background = background;
        this.frames = [];
    }

    update_frames() {
        frames = document.getElementsByClassName("frame");

        for (let i = 0; i < frames.length; i++) {
            frames[i].style.color = this.color;
            frames[i].style.background = this.background;
        }

    }
}

var Options_vid = new Options("null", 2000, "#ffffff", "#000000");

// function submitOptionsForm() {

//     if (options_form) {
//         options_form.addEventListener("submit", function (event) {
//             let formTitle = document.getElementById("video-title").value;
//             let formTime = document.getElementById("time").value;
//             let formTransition = document.getElementById("transition").value;
//             let formColor = document.getElementById("color").value;
//             let formBackground = document.getElementById("background").value;

//             Options_vid = new Options(formTitle, formTime, formTransition, formColor, formBackground);
//             Options_vid.update_frames();

//             console.log(Options_vid);
//             event.preventDefault();
//         });
//     }
// }

function sendRequest(url, options, successCallback, errorCallback) {
    var request = new XMLHttpRequest();


    request.onload = function () {
        var response = JSON.parse(request.responseText);

        if (request.status === 200) {
            successCallback(response);
        } else {
            console.log('Not authorized')
            errorCallback(response);
        }
    }

    request.open(options.method, url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(options.data);
}

function addedSuccessfully(response) {
    if (response["success"]) {
        showModalForSeconds(true);
        document.getElementsByClassName("modal-header")[0].style.backgroundColor = "#4BB543";
        document.getElementsByClassName("modal-body")[0].style.backgroundColor = "#4BB543";
        modalContent.innerHTML = "Ascii видеото беше добавено успешно";
    } else {
        if (response["errors"]) {
            if (response["code"] == 23000) {
                showModalForSeconds();
                modalContent.innerHTML = "Вие имате запазена видео с това име. Моля, изберете друго име и опитайте отново."
            } else {
                showModalForSeconds();
                modalContent.innerHTML = "Възникна грешка! Моля опитайте отново."
            }
        } else {
            document.getElementsByClassName("editor")[0].classList.remove("show-modal");
        }
    }
}

class Video {


    constructor(title, time, color, background, frames) {
        this.title = title;
        this.time = time;
        this.color = color;
        this.background = background;
        this.frames = frames;
        this.frames_count = frames.length;
        this.video_id = null;
    }

    addLabels() {
        let label = document.createElement("label");
        let title = document.createTextNode(this.title);

        label.setAttribute("class", "loaded-video-title");

        label.appendChild(title);

        let display_section = document.getElementsByClassName("sections")[3];

        display_section.appendChild(label);
    }

    makeLoadedVideo() {
        for (let i = 0; i < this.frames_count; i++) {
            var new_frame = document.createElement("textarea");
            new_frame.setAttribute("class", "video-frame");
            // new_frame.setAttribute("id", `frame-video-${i + 1}`);
            new_frame.setAttribute("class", "video-frames");
            new_frame.setAttribute("rows", TEXT_ROWS);
            new_frame.setAttribute("readonly", "");

            let text_value = this.frames[i];
            new_frame.appendChild(document.createTextNode(text_value));

            new_frame.style.color = this.color;
            new_frame.style.background = this.background;

            let section = document.getElementsByClassName("sections")[3];

            section.appendChild(new_frame);
        }
        // if (video_id) {
        //     clearTimeout(video_id);
        // }

        // let previous_video = document.getElementsByClassName("video-frames");
        // if (previous_video) {
        //     let length = previous_video.length;
        //     for (let i = 0; i < length; i++) {
        //         previous_video[0].remove();
        //     }
        // }

        // let length = Options_vid.frames.length;
        // for (let i = 0; i < length; i++) {
        //     Options_vid.frames.pop();
        // }

        // showSlides();

        // if (!stop_video) {
        //     stopButton();
        // }
    }
}


function loadUserVideos(response) {
    console.log(response);
    if (response["data"]) {
        for (let i = 0; i < response["data"].length; i++) {
            let new_title = response["data"][i]["title"];
            let new_time = response["data"][i]["time"];
            let new_color = response["data"][i]["color"];
            let new_background = response["data"][i]["background"];
            let new_frames = response["data"][i]["frames"];

            let new_video = new Video(new_title, new_time, new_color, new_background, new_frames);

            new_video.addLabels();
            new_video.makeLoadedVideo();
            loaded_videos.push(new_video);
        }
    }
}


function handleErrorAscii(response) {
    if (response["errors"]) {
        showModalForSeconds();
        modalContent.innerHTML = "Възникна грешка! Моля опитайте отново."
    } else {
        document.getElementsByClassName("editor")[0].classList.remove("show-modal");
    }
}

function saveVideo() {

    document.getElementsByClassName("ascii-form")[0].addEventListener("submit", function (event) {
        if (Options_vid.frames.length >= 2) {
            sendRequest('../../server/page_controllers/ascii-video-editor/save-video.php', { method: 'POST', data: `data=${JSON.stringify(Options_vid)}` }, addedSuccessfully, handleErrorAscii);
        }
        event.preventDefault();
    });
}

function loadVideos() {

    document.getElementById("load-videos").addEventListener("click", function (event) {
        var data = {};
        data["owner_id"] = 1;

        sendRequest(`../../server/page_controllers/ascii-video-editor/get-videos.php?owner_id=${data["owner_id"]}`, { method: 'GET', data: "" }, loadUserVideos, handleErrorAscii);
        event.preventDefault();
    });
}

function changeAsciiName() {
    document
        .getElementById("ascii-name")
        .addEventListener("change", function (event) {
            Options_vid.title = event.target.value;
        });
}

function addNewFrame() {

    new_frame_button.addEventListener("click", function () {
        if (number_of_frames < 10) {
            number_of_frames++;
            let new_frame_label = document.createElement("label");
            let context = document.createTextNode(`Frame ${number_of_frames}`);

            new_frame_label.appendChild(context);
            new_frame_label.setAttribute("for", `frame${number_of_frames}`);
            new_frame_label.setAttribute("id", `frame-label-${number_of_frames}`);
            new_frame_label.setAttribute("class", "frame-label");

            var new_frame = document.createElement("textarea");
            new_frame.setAttribute("cols", TEXT_COLLS);
            new_frame.setAttribute("rows", TEXT_ROWS);
            new_frame.setAttribute("class", "frame");
            new_frame.setAttribute("id", `frame${number_of_frames}`);

            let frames = document.getElementById("frames");

            frames.insertBefore(new_frame_label, new_frame_button);
            frames.insertBefore(new_frame, new_frame_button);

        }
    })
}

function removeFrame() {
    remove_frame_button.addEventListener("click", function () {
        if (number_of_frames >= 1) {
            let label = document.getElementById(`frame-label-${number_of_frames}`);
            let textarea = document.getElementById(`frame${number_of_frames}`);

            label.remove();
            textarea.remove();
            number_of_frames--;
        }
    })
}

function makeVideo() {
    if (number_of_frames >= 1) {
        make_video.addEventListener("click", function () {
            if (video_id) {
                clearTimeout(video_id);
            }

            let previous_video = document.getElementsByClassName("video-frames");
            if (previous_video) {
                let length = previous_video.length;
                for (let i = 0; i < length; i++) {
                    previous_video[0].remove();
                }
            }

            let length = Options_vid.frames.length;
            for (let i = 0; i < length; i++) {
                Options_vid.frames.pop();
            }

            for (let i = 0; i < number_of_frames; i++) {

                var new_frame = document.createElement("textarea");
                new_frame.setAttribute("class", "video-frame");
                new_frame.setAttribute("id", `frame-video-${i + 1}`);
                new_frame.setAttribute("class", "video-frames");
                new_frame.setAttribute("rows", TEXT_ROWS);
                new_frame.setAttribute("readonly", "");

                let text_value = document.getElementById(`frame${i + 1}`).value;
                new_frame.appendChild(document.createTextNode(text_value));

                Options_vid.frames.push(text_value);

                new_frame.style.color = Options_vid.color;
                new_frame.style.background = Options_vid.background;

                let video = document.getElementById("video");

                video.insertBefore(new_frame, make_video);
            }
            showSlides();

            if (!stop_video) {
                stopButton();
            }
        });
    }
}

let slideIndex = 0;
var video_id;

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("video-frames");

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;

    if (slideIndex > slides.length) {
        slideIndex = 1
    }
    slides[slideIndex - 1].style.display = "block";

    if (Options_vid) {
        video_id = setTimeout(showSlides, Options_vid.time);
    } else {
        video_id = setTimeout(showSlides, 2000);
    }

}

function setColors() {
    document.getElementById("color").addEventListener("change", function (e) {
        frames = document.getElementsByClassName("frame");

        for (let i = 0; i < frames.length; i++) {
            frames[i].style.color = e.target.value;
            Options_vid.color = e.target.value;
        }
    })
}

function setBackgroundColor() {
    document.getElementById("background").addEventListener("change", function (e) {
        frames = document.getElementsByClassName("frame");

        for (let i = 0; i < frames.length; i++) {
            frames[i].style.background = e.target.value;
            Options_vid.background = e.target.value;
        }
    })
}

function addAsciiCharacters() {
    let times = document.getElementsByClassName("timers")[0];

    for (let i = 100; i < 1400; i += 100) {
        let time = document.createElement("button");
        time.classList.add("times");
        time.innerHTML = `${i}`;
        times.appendChild(time);
    }

}

function toggleAsciiCharacters() {
    buttonToggleTime.addEventListener("click", function () {
        document.getElementsByClassName("timers")[0].classList.toggle("open");
    });
}

function chooseCharacter() {
    for (let i = 0; i < times.length; ++i) {
        times[i].addEventListener("click", function () {
            Options_vid.time = times[i].textContent;
            document.getElementsByClassName("time-btn")[0].innerHTML = Options_vid.time;
            document.getElementsByClassName("timers")[0].classList.toggle("open");
        });
    }
}

function changeAsciiName() {
    document.getElementById("ascii-name").addEventListener('change', function (event) {
        Options_vid.title = event.target.value;
    });
}

function stopButton() {
    let stop_button = document.createElement("button");
    let context = document.createTextNode("Stop");

    stop_button.appendChild(context);

    stop_button.setAttribute("type", "button");
    stop_button.setAttribute("id", "stop-button");
    stop_button.setAttribute("class", "menu-button");

    let video = document.getElementById("video");

    video.appendChild(stop_button);

    stop_video = document.getElementById("stop-button");

    stopVideo();
}

function stopVideo() {

    stop_video.addEventListener("click", function () {
        if (video_id) {
            clearTimeout(video_id);
        }
    })

}

document.addEventListener("DOMContentLoaded", function (event) {
    // submitOptionsForm();
    addNewFrame();
    removeFrame();
    makeVideo();
    setColors();
    setBackgroundColor();
    // stopVideo();
    addAsciiCharacters();
    toggleAsciiCharacters();
    chooseCharacter();
    changeAsciiName();
    saveVideo();
    modalFunctionality();
    loadVideos();
});