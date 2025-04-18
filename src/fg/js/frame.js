/* global spell */
function getImageSource(id) {
    return document.querySelector(`#${id}`).src;
}

function registerAddNoteLinks() {
    for (let link of document.getElementsByClassName('odh-addnote')) {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const ds = e.currentTarget.dataset;
            e.currentTarget.src = getImageSource('load');
            window.parent.postMessage({
                action: 'addNote',
                params: {
                    nindex: ds.nindex,
                    dindex: ds.dindex,
                    context: document.querySelector('.spell-content').innerHTML
                }
            }, '*');
        });
    }
}

function registerAudioLinks() {
    for (let link of document.getElementsByClassName('odh-playaudio')) {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const ds = e.currentTarget.dataset;
            window.parent.postMessage({
                action: 'playAudio',
                params: {
                    nindex: ds.nindex,
                    dindex: ds.dindex
                }
            }, '*');
        });
    }
}

function registerSoundLinks() {
    for (let link of document.getElementsByClassName('odh-playsound')) {
        link.setAttribute('src', getImageSource('play'));
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const ds = e.currentTarget.dataset;
            window.parent.postMessage({
                action: 'playSound',
                params: {
                    sound: ds.sound,
                }
            }, '*');
        });
    }
}

function initSpellnTranslation() {
    document.querySelector('#odh-container').appendChild(spell());
    document.querySelector('.spell-content').innerHTML = document.querySelector('#context').innerHTML;
    if (document.querySelector('#monolingual').innerText == '1')
        hideTranslation();
}

function registerHiddenClass() {
    for (let div of document.getElementsByClassName('odh-definition')) {
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            hideTranslation();
        });
    }
}

function hideTranslation() {
    let className = 'span.chn_dis, span.chn_tran, span.chn_sent, span.tgt_tran, span.tgt_sent'; // to add your bilingual translation div class name here.
    for (let div of document.querySelectorAll(className)) {
        div.classList.toggle('hidden');
    }
}

function registerSearchImage() {
    const button = document.getElementById('odh-img-search-btn');
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const term = document.querySelector('.odh-expression');
        if (!document.querySelector('img.odh-img')) {
            // send to extension
            window.parent.postMessage({
                action: 'searchImage',
                params: {
                    term: term.innerText
                }
            }, '*');
            // $(document).on("click", <selector>, handler)
            document.getElementById('odh-img-search').addEventListener("click", function (e) {
                for (let target = e.target; target && target != this; target = target.parentNode) {
                    // loop parent nodes from the target to the delegation node
                    function selectCurrentImage(e) {
                        window.parent.postMessage({
                            action: 'selectImage',
                            params: {
                                imgUrl: e.target.src
                            }
                        }, '*');
                    }
                    if (target.matches('img.odh-img')) {
                        selectCurrentImage.call(target, e);
                        break;
                    }
                }
            }, false);
        }
    });
}

function onDomContentLoaded() {
    registerAddNoteLinks();
    registerAudioLinks();
    registerSoundLinks();
    registerHiddenClass();
    registerSearchImage();
    initSpellnTranslation();
}

function onMessage(e) {
    const { action, params } = e.data;
    const method = window['api_' + action];
    if (typeof (method) === 'function') {
        method(params);
    }
}

function api_setActionState(result) {
    const { response, params } = result;
    const { nindex, dindex } = params;

    const match = document.querySelector(`.odh-addnote[data-nindex="${nindex}"].odh-addnote[data-dindex="${dindex}"]`);
    if (response)
        match.src = getImageSource('good');
    else
        match.src = getImageSource('fail');

    setTimeout(() => {
        match.src = getImageSource('plus');
    }, 1000);
}

// receive call from extension
function api_loadImages(result) {
    const { img_urls } = result;
    document.getElementById('odh-img-search').innerHTML = img_urls.slice(0, 5)
        .map(url => `<img class='odh-img' src='${url}'/>`)
        .join('\n');

}

function onMouseWheel(e) {
    document.querySelector('html').scrollTop -= e.wheelDeltaY / 3;
    document.querySelector('body').scrollTop -= e.wheelDeltaY / 3;
    e.preventDefault();
}

document.addEventListener('DOMContentLoaded', onDomContentLoaded, false);
window.addEventListener('message', onMessage);
window.addEventListener('wheel', onMouseWheel, { passive: false });