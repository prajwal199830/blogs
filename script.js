// ======================================================
// THINK1SPACE
// ======================================================


// ======================================================
// FIREBASE CONFIG
// ======================================================

const firebaseConfig = {

    apiKey: "AIzaSyD252enNOxxPmkCZn5UdGJPpPcivBXGj_I",

    authDomain:
        "think1space.firebaseapp.com",

    projectId:
        "think1space",

    storageBucket:
        "think1space.firebasestorage.app",

    messagingSenderId:
        "616719400695",

    appId:
        "1:616719400695:web:0348ce242a7061a1ae1df2",

    measurementId:
        "G-84ECV7VZ1T"

};


// ======================================================
// LOAD FIREBASE
// ======================================================

const firebaseAppScript =
    document.createElement("script");

firebaseAppScript.src =
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js";

firebaseAppScript.onload =
    loadFirestore;

document.head.appendChild(
    firebaseAppScript
);


function loadFirestore() {

    const firestoreScript =
        document.createElement("script");

    firestoreScript.src =
        "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore-compat.js";

    firestoreScript.onload =
        initializeFirebase;

    document.head.appendChild(
        firestoreScript
    );

}


// ======================================================
// FIREBASE
// ======================================================

let db = null;


function initializeFirebase() {

    firebase.initializeApp(
        firebaseConfig
    );

    db =
        firebase.firestore();

    console.log(
        "Firebase connected."
    );

    loadIdeas();

}


// ======================================================
// STATE
// ======================================================

let ideas = [];

let currentIndex = 0;

let contributionType = "build";


// ======================================================
// ELEMENTS
// ======================================================

const featuredIdea =
    document.getElementById(
        "featuredIdea"
    );

const ideaCounter =
    document.getElementById(
        "ideaCounter"
    );

const buildCount =
    document.getElementById(
        "buildCount"
    );

const challengeCount =
    document.getElementById(
        "challengeCount"
    );

const connectCount =
    document.getElementById(
        "connectCount"
    );

const buildsContainer =
    document.getElementById(
        "buildsContainer"
    );

const challengesContainer =
    document.getElementById(
        "challengesContainer"
    );

const connectionsContainer =
    document.getElementById(
        "connectionsContainer"
    );

const moreIdeas =
    document.getElementById(
        "moreIdeas"
    );

const submitModal =
    document.getElementById(
        "submitModal"
    );

const contributionModal =
    document.getElementById(
        "contributionModal"
    );

const ideaForm =
    document.getElementById(
        "ideaForm"
    );

const contributionForm =
    document.getElementById(
        "contributionForm"
    );

const ideaText =
    document.getElementById(
        "ideaText"
    );

const charCount =
    document.getElementById(
        "charCount"
    );


// ======================================================
// SUBMIT MODAL
// ======================================================

function openSubmit() {

    submitModal.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

}


function closeSubmit() {

    submitModal.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

}


// ======================================================
// CONTRIBUTION MODAL
// ======================================================

function openContributions(type) {

    openContributionForm(type);

}


function openContributionForm(type) {

    contributionType =
        type;


    const title =
        document.getElementById(
            "contributionTitle"
        );

    const heading =
        document.getElementById(
            "contributionHeading"
        );

    const textarea =
        document.getElementById(
            "contributionText"
        );


    if (type === "build") {

        title.textContent =
            "BUILD ON THIS IDEA";

        heading.textContent =
            "How could this idea become better?";

        textarea.placeholder =
            "Suggest an improvement, solution or way to make this idea real...";

    }


    if (type === "challenge") {

        title.textContent =
            "CHALLENGE THIS IDEA";

        heading.textContent =
            "What could go wrong?";

        textarea.placeholder =
            "Point out a problem, limitation or something we should consider...";

    }


    if (type === "connect") {

        title.textContent =
            "CONNECT THIS IDEA";

        heading.textContent =
            "What other idea does this remind you of?";

        textarea.placeholder =
            "Explain the connection between this idea and another thought...";

    }


    contributionModal.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

}


function closeContribution() {

    contributionModal.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

}


// ======================================================
// LOAD IDEAS
// ======================================================

async function loadIdeas() {

    if (!db) {

        return;

    }


    try {

        const snapshot =
            await db
                .collection("ideas")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();


        ideas = [];


        snapshot.forEach(
            doc => {

                const data =
                    doc.data();


                ideas.push({

                    id:
                        doc.id,

                    text:
                        data.text || "",

                    author:
                        data.author ||
                        "Anonymous",

                    builds: [],

                    challenges: [],

                    connections: []

                });

            }
        );


        await loadContributions();


        if (
            ideas.length === 0
        ) {

            showEmptyState();

            return;

        }


        if (
            currentIndex >=
            ideas.length
        ) {

            currentIndex = 0;

        }


        showFeaturedIdea();

        displayMoreIdeas();

    }

    catch (error) {

        console.error(
            "Error loading ideas:",
            error
        );

    }

}


// ======================================================
// LOAD CONTRIBUTIONS
// ======================================================

async function loadContributions() {


    // BUILDS
    const builds =
        await db
            .collection("builds")
            .get();


    builds.forEach(
        doc => {

            const data =
                doc.data();


            const idea =
                ideas.find(
                    item =>
                        item.id ===
                        data.ideaId
                );


            if (idea) {

                idea.builds.push({

                    text:
                        data.text || "",

                    author:
                        data.author ||
                        "Anonymous"

                });

            }

        }
    );


    // CHALLENGES
    const challenges =
        await db
            .collection("challenges")
            .get();


    challenges.forEach(
        doc => {

            const data =
                doc.data();


            const idea =
                ideas.find(
                    item =>
                        item.id ===
                        data.ideaId
                );


            if (idea) {

                idea.challenges.push({

                    text:
                        data.text || "",

                    author:
                        data.author ||
                        "Anonymous"

                });

            }

        }
    );


    // CONNECTIONS
    const connections =
        await db
            .collection("connections")
            .get();


    connections.forEach(
        doc => {

            const data =
                doc.data();


            const idea =
                ideas.find(
                    item =>
                        item.id ===
                        data.ideaId
                );


            if (idea) {

                idea.connections.push({

                    text:
                        data.text || "",

                    author:
                        data.author ||
                        "Anonymous"

                });

            }

        }
    );

}


// ======================================================
// FEATURED IDEA
// ======================================================

function showFeaturedIdea() {

    const idea =
        ideas[currentIndex];


    featuredIdea.innerHTML = `

        <div class="featured-type">
            💭 THOUGHT
        </div>

        <div class="featured-text">
            ${escapeHTML(
                idea.text
            )}
        </div>

        <div class="featured-author">
            — ${escapeHTML(
                idea.author
            )}
        </div>

    `;


    buildCount.textContent =
        idea.builds.length;


    challengeCount.textContent =
        idea.challenges.length;


    connectCount.textContent =
        idea.connections.length;


    ideaCounter.textContent =
        `${String(
            currentIndex + 1
        ).padStart(2, "0")} / ${String(
            ideas.length
        ).padStart(2, "0")}`;


    displayBuilds();

    displayChallenges();

    displayConnections();

}


// ======================================================
// BUILDS
// ======================================================

function displayBuilds() {

    const idea =
        ideas[currentIndex];


    buildsContainer.innerHTML =
        "";


    idea.builds
        .slice(0, 2)
        .forEach(
            build => {

                buildsContainer.innerHTML += `

                    <div class="contribution">

                        <div class="contribution-type">
                            💡 BUILD
                        </div>

                        <div class="contribution-text">
                            ${escapeHTML(
                                build.text
                            )}
                        </div>

                        <div class="contribution-author">
                            — ${escapeHTML(
                                build.author
                            )}
                        </div>

                    </div>

                `;

            }
        );


    if (
        idea.builds.length === 0
    ) {

        buildsContainer.innerHTML = `

            <div class="contribution">

                <div class="contribution-text">
                    No builds yet. Be the first.
                </div>

            </div>

        `;

    }

}


// ======================================================
// CHALLENGES
// ======================================================

function displayChallenges() {

    const idea =
        ideas[currentIndex];


    challengesContainer.innerHTML =
        "";


    idea.challenges
        .slice(0, 2)
        .forEach(
            challenge => {

                challengesContainer.innerHTML += `

                    <div class="contribution">

                        <div class="contribution-type">
                            ⚠ CHALLENGE
                        </div>

                        <div class="contribution-text">
                            ${escapeHTML(
                                challenge.text
                            )}
                        </div>

                        <div class="contribution-author">
                            — ${escapeHTML(
                                challenge.author
                            )}
                        </div>

                    </div>

                `;

            }
        );


    if (
        idea.challenges.length === 0
    ) {

        challengesContainer.innerHTML = `

            <div class="contribution">

                <div class="contribution-text">
                    No challenges yet.
                </div>

            </div>

        `;

    }

}


// ======================================================
// CONNECTIONS
// ======================================================

function displayConnections() {

    if (!connectionsContainer) {

        return;

    }


    const idea =
        ideas[currentIndex];


    connectionsContainer.innerHTML =
        "";


    idea.connections
        .slice(0, 2)
        .forEach(
            connection => {

                connectionsContainer.innerHTML += `

                    <div class="contribution">

                        <div class="contribution-type">
                            🔗 CONNECTION
                        </div>

                        <div class="contribution-text">
                            ${escapeHTML(
                                connection.text
                            )}
                        </div>

                        <div class="contribution-author">
                            — ${escapeHTML(
                                connection.author
                            )}
                        </div>

                    </div>

                `;

            }
        );


    if (
        idea.connections.length === 0
    ) {

        connectionsContainer.innerHTML = `

            <div class="contribution">

                <div class="contribution-text">
                    No connections yet.
                    What does this idea remind you of?
                </div>

            </div>

        `;

    }

}


// ======================================================
// MORE IDEAS
// ======================================================

function displayMoreIdeas() {

    moreIdeas.innerHTML =
        "";


    ideas
        .filter(
            (_, index) =>
                index !== currentIndex
        )
        .slice(0, 6)
        .forEach(
            idea => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "more-idea";


                card.innerHTML = `

                    <div class="more-idea-text">
                        ${escapeHTML(
                            idea.text
                        )}
                    </div>

                    <div class="more-idea-author">
                        — ${escapeHTML(
                            idea.author
                        )}
                    </div>

                `;


                card.onclick =
                    function() {

                        currentIndex =
                            ideas.indexOf(
                                idea
                            );

                        showFeaturedIdea();

                    };


                moreIdeas.appendChild(
                    card
                );

            }
        );

}


// ======================================================
// PREVIOUS / NEXT
// ======================================================

function previousIdea() {

    if (!ideas.length) return;


    currentIndex--;


    if (
        currentIndex < 0
    ) {

        currentIndex =
            ideas.length - 1;

    }


    showFeaturedIdea();

}


function nextIdea() {

    if (!ideas.length) return;


    currentIndex++;


    if (
        currentIndex >=
        ideas.length
    ) {

        currentIndex = 0;

    }


    showFeaturedIdea();

}


// ======================================================
// SUBMIT IDEA
// ======================================================

ideaForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (!db) {

            alert(
                "Firebase is still connecting."
            );

            return;

        }


        const name =
            document
                .getElementById(
                    "userName"
                )
                .value
                .trim();


        const text =
            ideaText
                .value
                .trim();


        if (!name || !text) {

            return;

        }


        const button =
            ideaForm.querySelector(
                ".publish-button"
            );


        button.disabled =
            true;


        button.textContent =
            "Publishing...";


        try {

            await db
                .collection("ideas")
                .add({

                    text:
                        text,

                    author:
                        name,

                    status:
                        "published",

                    createdAt:
                        firebase
                            .firestore
                            .FieldValue
                            .serverTimestamp()

                });


            ideaForm.reset();

            charCount.textContent =
                "0";


            closeSubmit();

            currentIndex = 0;

            await loadIdeas();

        }

        catch (error) {

            console.error(
                error
            );


            alert(
                "Unable to publish your idea."
            );

        }


        button.disabled =
            false;


        button.textContent =
            "Publish Your Idea →";

    }
);


// ======================================================
// SUBMIT CONTRIBUTION
// ======================================================

contributionForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (!db || !ideas.length) {

            return;

        }


        const name =
            document
                .getElementById(
                    "contributorName"
                )
                .value
                .trim();


        const text =
            document
                .getElementById(
                    "contributionText"
                )
                .value
                .trim();


        if (!name || !text) {

            return;

        }


        let collectionName;


        if (
            contributionType ===
            "build"
        ) {

            collectionName =
                "builds";

        }

        else if (
            contributionType ===
            "challenge"
        ) {

            collectionName =
                "challenges";

        }

        else {

            collectionName =
                "connections";

        }


        const button =
            contributionForm.querySelector(
                ".publish-button"
            );


        button.disabled =
            true;


        button.textContent =
            "Adding...";


        try {

            await db
                .collection(
                    collectionName
                )
                .add({

                    ideaId:
                        ideas[
                            currentIndex
                        ].id,

                    text:
                        text,

                    author:
                        name,

                    createdAt:
                        firebase
                            .firestore
                            .FieldValue
                            .serverTimestamp()

                });


            contributionForm.reset();

            closeContribution();

            await loadIdeas();

        }

        catch (error) {

            console.error(
                error
            );


            alert(
                "Unable to add contribution."
            );

        }


        button.disabled =
            false;


        button.textContent =
            "Add Contribution →";

    }
);


// ======================================================
// CHARACTER COUNTER
// ======================================================

ideaText.addEventListener(
    "input",
    function() {

        charCount.textContent =
            ideaText.value.length;

    }
);


// ======================================================
// EMPTY STATE
// ======================================================

function showEmptyState() {

    featuredIdea.innerHTML = `

        <div class="featured-type">
            ✦ FIRST THOUGHT
        </div>

        <div class="featured-text">
            Be the first person to share an idea.
        </div>

    `;


    buildCount.textContent =
        "0";

    challengeCount.textContent =
        "0";

    connectCount.textContent =
        "0";

    ideaCounter.textContent =
        "00 / 00";

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


// ======================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ======================================================

window.openSubmit =
    openSubmit;

window.closeSubmit =
    closeSubmit;

window.openContributions =
    openContributions;

window.openContributionForm =
    openContributionForm;

window.closeContribution =
    closeContribution;

window.previousIdea =
    previousIdea;

window.nextIdea =
    nextIdea;


// ======================================================
// START
// ======================================================

console.log(
    "Think1Space loaded."
);