/* =========================================================
   EvidenceLens
   Frontend JavaScript
   ========================================================= */


/* ================= STATE ================= */

const state = {
    currentPage: "overview",
    selectedDemo: "old",
    uploadedImage: null,
    selectedDecision: null,

    analysis: {
        verdict: "MIXED",
        confidence: 81,
        similarity: 92,
        explanation:
            "Available evidence supports the disaster event and location, but the media evidence points to an earlier occurrence.",
        when: "Mismatch",
        where: "Match",
        what: "Match",
        media: "Reused",

        claims: [
            {
                type: "EVENT",
                text: "Flooding occurred.",
                result: "SUPPORTED",
                confidence: 91,
                evidence: 2
            },
            {
                type: "LOCATION",
                text: "The event occurred in Chennai.",
                result: "SUPPORTED",
                confidence: 94,
                evidence: 3
            },
            {
                type: "TIME",
                text: "The event occurred during August 2026.",
                result: "INSUFFICIENT",
                confidence: 48,
                evidence: 1
            },
            {
                type: "MEDIA CONTEXT",
                text: "The uploaded image represents the claimed 2026 event.",
                result: "CONTRADICTED",
                confidence: 87,
                evidence: 2
            }
        ]
    }
};


/* ================= DEMO DATA ================= */

const demoCases = {

    old: {
        claim: "This image shows flooding in Chennai during August 2026.",

        verdict: "MIXED",
        confidence: 81,
        similarity: 92,

        explanation:
            "Current evidence supports flooding in Chennai, but the uploaded media appears visually consistent with an earlier flood event. The media context therefore cannot be confirmed.",

        when: "Mismatch",
        where: "Match",
        what: "Match",
        media: "Reused",

        claims: [
            {
                type: "EVENT",
                text: "Flooding occurred.",
                result: "SUPPORTED",
                confidence: 91,
                evidence: 2
            },
            {
                type: "LOCATION",
                text: "The event occurred in Chennai.",
                result: "SUPPORTED",
                confidence: 94,
                evidence: 3
            },
            {
                type: "TIME",
                text: "The event occurred during August 2026.",
                result: "INSUFFICIENT",
                confidence: 48,
                evidence: 1
            },
            {
                type: "MEDIA CONTEXT",
                text: "The uploaded image represents the claimed 2026 event.",
                result: "CONTRADICTED",
                confidence: 87,
                evidence: 2
            }
        ]
    },


    supported: {
        claim:
            "This image shows flooding reported in Chennai during the current event.",

        verdict: "SUPPORTED",
        confidence: 91,
        similarity: 78,

        explanation:
            "The available prototype evidence consistently supports flooding in Chennai during the current event, and no strong contextual contradiction was found.",

        when: "Match",
        where: "Match",
        what: "Match",
        media: "Consistent",

        claims: [
            {
                type: "EVENT",
                text: "Flooding occurred.",
                result: "SUPPORTED",
                confidence: 94,
                evidence: 3
            },
            {
                type: "LOCATION",
                text: "The event occurred in Chennai.",
                result: "SUPPORTED",
                confidence: 96,
                evidence: 3
            },
            {
                type: "TIME",
                text: "The event occurred during the current event.",
                result: "SUPPORTED",
                confidence: 89,
                evidence: 2
            },
            {
                type: "MEDIA CONTEXT",
                text: "The uploaded image is consistent with the claimed event.",
                result: "SUPPORTED",
                confidence: 82,
                evidence: 2
            }
        ]
    },


    unknown: {
        claim:
            "This image shows a landslide occurring today in a remote location.",

        verdict: "INSUFFICIENT EVIDENCE",
        confidence: 18,
        similarity: 31,

        explanation:
            "No strong matching media or reliable supporting evidence was found in the current prototype evidence corpus.",

        when: "Unknown",
        where: "Unknown",
        what: "Unknown",
        media: "No strong match",

        claims: [
            {
                type: "EVENT",
                text: "A landslide occurred.",
                result: "INSUFFICIENT",
                confidence: 18,
                evidence: 0
            },
            {
                type: "LOCATION",
                text: "The event occurred at the claimed remote location.",
                result: "INSUFFICIENT",
                confidence: 12,
                evidence: 0
            },
            {
                type: "TIME",
                text: "The event occurred today.",
                result: "INSUFFICIENT",
                confidence: 15,
                evidence: 0
            },
            {
                type: "MEDIA CONTEXT",
                text: "The uploaded image represents the claimed event.",
                result: "INSUFFICIENT",
                confidence: 22,
                evidence: 0
            }
        ]
    },


    conflict: {
        claim:
            "800 people were evacuated from the affected area.",

        verdict: "MIXED",
        confidence: 63,
        similarity: 74,

        explanation:
            "Credible demo sources disagree about the number of people evacuated. EvidenceLens preserves this disagreement instead of resolving it through simple majority voting.",

        when: "Match",
        where: "Match",
        what: "Conflicting",
        media: "Consistent",

        claims: [
            {
                type: "EVENT",
                text: "An evacuation occurred.",
                result: "SUPPORTED",
                confidence: 90,
                evidence: 2
            },
            {
                type: "LOCATION",
                text: "The evacuation occurred in the affected area.",
                result: "SUPPORTED",
                confidence: 88,
                evidence: 2
            },
            {
                type: "TIME",
                text: "The evacuation occurred during the current event.",
                result: "SUPPORTED",
                confidence: 84,
                evidence: 2
            },
            {
                type: "COUNT",
                text: "800 people were evacuated.",
                result: "MIXED",
                confidence: 63,
                evidence: 2
            }
        ]
    }
};


/* ================= DOM ELEMENTS ================= */

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const pageTitle = document.getElementById("pageTitle");
const claimInput = document.getElementById("claimInput");

const uploadZone = document.getElementById("uploadZone");
const imageInput = document.getElementById("imageInput");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const fileName = document.getElementById("fileName");

const analyzeBtn = document.getElementById("analyzeBtn");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");


/* ================= ICONS ================= */

function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}


/* ================= PAGE NAMES ================= */

const pageNames = {
    overview: "Overview",
    verify: "Verify Claim",
    evidence: "Evidence",
    media: "Media Provenance",
    graph: "Evidence Graph",
    review: "Review",
    reports: "Reports",
    results: "Verification Analysis"
};


/* ================= NAVIGATION ================= */

function navigateTo(page) {

    pages.forEach(function (section) {
        section.classList.toggle(
            "active",
            section.id === page
        );
    });

    navItems.forEach(function (item) {
        item.classList.toggle(
            "active",
            item.dataset.page === page
        );
    });

    if (pageTitle) {
        pageTitle.textContent =
            pageNames[page] || "Overview";
    }

    state.currentPage = page;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    refreshIcons();
}


/* ================= NAV EVENTS ================= */

navItems.forEach(function (item) {

    item.addEventListener("click", function () {
        navigateTo(item.dataset.page);
    });

});


document.querySelectorAll("[data-go]").forEach(function (button) {

    button.addEventListener("click", function () {
        navigateTo(button.dataset.go);
    });

});


/* ================= MOBILE MENU ================= */

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.querySelector(".sidebar");


if (mobileMenu && sidebar) {

    mobileMenu.addEventListener("click", function () {
        sidebar.classList.toggle("mobile-open");
    });

}


navItems.forEach(function (item) {

    item.addEventListener("click", function () {

        if (sidebar) {
            sidebar.classList.remove("mobile-open");
        }

    });

});


/* ================= TOAST ================= */

let toastTimer = null;


function showToast(message) {

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}


/* ================= DEMO BUTTONS ================= */

document.querySelectorAll(".demo-btn").forEach(function (button) {

    button.addEventListener("click", function () {

        const demo = button.dataset.demo;

        loadDemo(demo);

    });

});


function loadDemo(demo) {

    const data = demoCases[demo];

    if (!data) {
        return;
    }

    state.selectedDemo = demo;

    state.analysis =
        JSON.parse(JSON.stringify(data));

    if (claimInput) {
        claimInput.value = data.claim;
    }

    state.uploadedImage = null;

    if (imagePreview) {
        imagePreview.classList.add("hidden");
    }

    if (uploadPlaceholder) {
        uploadPlaceholder.classList.remove("hidden");
    }

    if (imageInput) {
        imageInput.value = "";
    }

    if (demo === "old") {
        showToast("Old Image + New Caption demo loaded");
    } else {
        showToast("Demo case loaded");
    }

}


/* ================= IMAGE UPLOAD ================= */

if (uploadZone && imageInput) {

    uploadZone.addEventListener("click", function (event) {

        if (event.target.closest("#removeImage")) {
            return;
        }

        imageInput.click();

    });


    imageInput.addEventListener("change", function (event) {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        handleImage(file);

    });


    uploadZone.addEventListener("dragover", function (event) {

        event.preventDefault();

        uploadZone.classList.add("dragover");

    });


    uploadZone.addEventListener("dragleave", function () {

        uploadZone.classList.remove("dragover");

    });


    uploadZone.addEventListener("drop", function (event) {

        event.preventDefault();

        uploadZone.classList.remove("dragover");

        const file =
            event.dataTransfer.files[0];

        if (file) {
            handleImage(file);
        }

    });

}


function handleImage(file) {

    if (!file.type.startsWith("image/")) {

        showToast("Please select an image file.");

        return;
    }


    if (file.size > 10 * 1024 * 1024) {

        showToast("Image must be smaller than 10 MB.");

        return;
    }


    state.uploadedImage = file;

    const reader = new FileReader();


    reader.onload = function (event) {

        if (previewImg) {
            previewImg.src = event.target.result;
        }

        if (fileName) {
            fileName.textContent = file.name;
        }

        if (uploadPlaceholder) {
            uploadPlaceholder.classList.add("hidden");
        }

        if (imagePreview) {
            imagePreview.classList.remove("hidden");
        }

        refreshIcons();
    };


    reader.readAsDataURL(file);
}


/* ================= REMOVE IMAGE ================= */

const removeImage =
    document.getElementById("removeImage");


if (removeImage) {

    removeImage.addEventListener("click", function (event) {

        event.stopPropagation();

        state.uploadedImage = null;

        if (imageInput) {
            imageInput.value = "";
        }

        if (imagePreview) {
            imagePreview.classList.add("hidden");
        }

        if (uploadPlaceholder) {
            uploadPlaceholder.classList.remove("hidden");
        }

        showToast("Image removed.");

    });

}


/* ================= ANALYZE ================= */

if (analyzeBtn) {

    analyzeBtn.addEventListener(
        "click",
        runAnalysis
    );

}


function runAnalysis() {

    const claim = claimInput
        ? claimInput.value.trim()
        : "";

    if (!claim) {
        showToast("Please enter a claim first.");
        return;
    }

    const originalText = analyzeBtn.innerHTML;

    analyzeBtn.disabled = true;

    analyzeBtn.innerHTML = `
        <i data-lucide="loader-circle"></i>
        Analyzing...
    `;

    refreshIcons();

    const formData = new FormData();

    formData.append("claim", claim);

    if (state.uploadedImage) {
        formData.append("image", state.uploadedImage);
    }

    fetch("/api/analyze", {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Server error");
            }

            return response.json();
        })
        .then(data => {

            if (!data.success) {
                throw new Error(
                    data.message || "Analysis failed."
                );
            }

            state.analysis = {

                ...state.analysis,

                claim: data.claim,

                verdict: data.verdict,

                confidence: data.confidence,

                explanation: data.explanation

            };

            renderResults();

            navigateTo("results");

            showToast(
                "Analysis completed successfully."
            );

        })
        .catch(error => {

            console.error("Analysis error:", error);

            showToast(
                "Could not connect to the Flask backend."
            );

        })
        .finally(() => {

            analyzeBtn.disabled = false;

            analyzeBtn.innerHTML = originalText;

            refreshIcons();

        });

}





/* ================= VERDICT COLOR ================= */

function verdictColor(verdict) {

    if (verdict === "SUPPORTED") {
        return "var(--green)";
    }

    if (verdict === "CONTRADICTED") {
        return "var(--red)";
    }

    if (verdict === "INSUFFICIENT EVIDENCE") {
        return "#94a3b8";
    }

    return "var(--yellow)";
}


function verdictBorder(verdict) {

    if (verdict === "SUPPORTED") {
        return "rgba(53,212,154,0.22)";
    }

    if (verdict === "CONTRADICTED") {
        return "rgba(255,100,124,0.22)";
    }

    if (verdict === "INSUFFICIENT EVIDENCE") {
        return "rgba(148,163,184,0.2)";
    }

    return "rgba(247,189,85,0.22)";
}


/* ================= RESULT RENDERING ================= */

function renderResults() {

    const data = state.analysis;


    const resultSummary =
        document.getElementById("resultSummary");

    if (resultSummary) {
        resultSummary.textContent =
            data.claim;
    }


    const verdictText =
        document.getElementById("verdictText");

    if (verdictText) {
        verdictText.textContent =
            data.verdict;
    }


    const verdictExplanation =
        document.getElementById("verdictExplanation");

    if (verdictExplanation) {
        verdictExplanation.textContent =
            data.explanation;
    }


    const confidenceValue =
        document.getElementById("confidenceValue");

    if (confidenceValue) {
        confidenceValue.textContent =
            data.confidence + "%";
    }


    const confidenceFill =
        document.getElementById("confidenceFill");

    if (confidenceFill) {

        confidenceFill.style.width =
            data.confidence + "%";

        confidenceFill.style.background =
            verdictColor(data.verdict);
    }


    const similarityValue =
        document.getElementById("similarityValue");

    if (similarityValue) {
        similarityValue.textContent =
            data.similarity + "%";
    }


    const mediaSimilarityBar =
        document.getElementById("mediaSimilarityBar");

    if (mediaSimilarityBar) {
        mediaSimilarityBar.style.width =
            data.similarity + "%";
    }


    const banner =
        document.getElementById("verdictBanner");

    if (banner) {
        banner.style.borderColor =
            verdictBorder(data.verdict);
    }


    renderVerdictIcon(data.verdict);

    renderClaims(data.claims);

    renderFingerprint(data);

    renderReport(data);

    refreshIcons();
}


/* ================= VERDICT ICON ================= */

function renderVerdictIcon(verdict) {

    const container =
        document.getElementById("verdictSymbol");

    if (!container) {
        return;
    }


    let icon = "triangle-alert";

    if (verdict === "SUPPORTED") {
        icon = "circle-check";
    } else if (verdict === "CONTRADICTED") {
        icon = "circle-x";
    } else if (verdict === "INSUFFICIENT EVIDENCE") {
        icon = "circle-help";
    }


    container.innerHTML =
        '<i data-lucide="' + icon + '"></i>';

    container.style.color =
        verdictColor(verdict);


    if (verdict === "SUPPORTED") {

        container.style.background =
            "rgba(53,212,154,0.08)";

    } else if (verdict === "CONTRADICTED") {

        container.style.background =
            "rgba(255,100,124,0.08)";

    } else if (verdict === "INSUFFICIENT EVIDENCE") {

        container.style.background =
            "rgba(148,163,184,0.07)";

    } else {

        container.style.background =
            "rgba(247,189,85,0.08)";
    }


    refreshIcons();
}


/* ================= CLAIMS ================= */

function renderClaims(claims) {

    const container =
        document.getElementById("claimsContainer");

    if (!container) {
        return;
    }


    container.innerHTML = "";


    const claimCount =
        document.getElementById("claimCount");

    if (claimCount) {
        claimCount.textContent =
            claims.length + " claims";
    }


    claims.forEach(function (claim, index) {

        const card =
            document.createElement("div");

        card.className =
            "claim-card";


        let resultClass =
            "result-insufficient";

        if (claim.result === "SUPPORTED") {
            resultClass = "result-supported";
        } else if (claim.result === "CONTRADICTED") {
            resultClass = "result-contradicted";
        } else if (claim.result === "MIXED") {
            resultClass = "result-mixed";
        }


        const number =
            String(index + 1).padStart(2, "0");


        card.innerHTML =
            '<div class="claim-number">' +
            number +
            '</div>' +

            '<div>' +
            '<div class="claim-type">' +
            escapeHTML(claim.type) +
            '</div>' +

            '<div class="claim-text">' +
            escapeHTML(claim.text) +
            '</div>' +
            '</div>' +

            '<div class="claim-result">' +
            '<strong class="' + resultClass + '">' +
            escapeHTML(claim.result) +
            '</strong>' +

            '<span>' +
            claim.confidence +
            '% · ' +
            claim.evidence +
            ' evidence' +
            '</span>' +
            '</div>';


        container.appendChild(card);
    });
}


/* ================= FINGERPRINT ================= */

function renderFingerprint(data) {

    const whenStatus =
        document.getElementById("whenStatus");

    const whereStatus =
        document.getElementById("whereStatus");

    const whatStatus =
        document.getElementById("whatStatus");

    const mediaStatus =
        document.getElementById("mediaStatus");


    if (whenStatus) {
        whenStatus.textContent =
            data.when;
    }

    if (whereStatus) {
        whereStatus.textContent =
            data.where;
    }

    if (whatStatus) {
        whatStatus.textContent =
            data.what;
    }

    if (mediaStatus) {
        mediaStatus.textContent =
            data.media;
    }


    const rows =
        document.querySelectorAll(".fingerprint-row");


    rows.forEach(function (row) {

        const strong =
            row.querySelector("strong");

        const status =
            row.querySelector(".fingerprint-status");


        if (!strong || !status) {
            return;
        }


        const value =
            strong.textContent
                .toLowerCase();


        const positive =
            value === "match" ||
            value === "consistent";


        status.className =
            "fingerprint-status " +
            (positive ? "good" : "warning");


        status.innerHTML =
            '<i data-lucide="' +
            (positive ? "check" : "triangle-alert") +
            '"></i>';
    });


    refreshIcons();
}


/* ================= EVIDENCE DATA ================= */

const evidenceData = [

    {
        source: "Regional Disaster Authority",
        type: "Official-style demo source",
        date: "27 Aug 2026",
        relation: "SUPPORTS",
        relevance: 94,
        excerpt:
            "Flooding was reported across multiple Chennai areas during the current weather event.",
        freshness: "Fresh"
    },

    {
        source: "Curated News Archive",
        type: "Archived media record",
        date: "14 Nov 2024",
        relation: "CONTRADICTS",
        relevance: 91,
        excerpt:
            "The submitted image is visually consistent with media published during a previous Chennai flood event.",
        freshness: "Old"
    },

    {
        source: "Emergency Operations Demo Feed",
        type: "Public information",
        date: "28 Aug 2026",
        relation: "SUPPORTS",
        relevance: 88,
        excerpt:
            "Current reports indicate flooding in several low-lying areas of Chennai.",
        freshness: "Fresh"
    },

    {
        source: "Archived Image Record",
        type: "Media provenance",
        date: "14 Nov 2024",
        relation: "CONTRADICTS",
        relevance: 89,
        excerpt:
            "Archived metadata associates the visually matching image with an earlier flood occurrence.",
        freshness: "Old"
    }
];


/* ================= RENDER EVIDENCE ================= */

function renderEvidence() {

    const container =
        document.getElementById("evidenceContainer");

    if (!container) {
        return;
    }


    container.innerHTML = "";


    evidenceData.forEach(function (item) {

        const card =
            document.createElement("div");

        card.className =
            "evidence-card";


        const relationClass =
            item.relation === "SUPPORTS"
                ? "support"
                : "contradict";


        let icon = "newspaper";

        if (
            item.type.toLowerCase().includes("media") ||
            item.type.toLowerCase().includes("image")
        ) {
            icon = "image";
        }


        card.innerHTML =
            '<div class="evidence-top">' +

            '<div class="source-info">' +

            '<div class="source-icon">' +
            '<i data-lucide="' +
            icon +
            '"></i>' +
            '</div>' +

            '<div>' +
            '<strong>' +
            escapeHTML(item.source) +
            '</strong>' +

            '<span>' +
            escapeHTML(item.type) +
            '</span>' +
            '</div>' +

            '</div>' +

            '<span class="relation ' +
            relationClass +
            '">' +
            escapeHTML(item.relation) +
            '</span>' +

            '</div>' +

            '<div class="evidence-excerpt">' +
            '&ldquo;' +
            escapeHTML(item.excerpt) +
            '&rdquo;' +
            '</div>' +

            '<div class="evidence-meta">' +

            '<span>' +
            'Date: <strong>' +
            escapeHTML(item.date) +
            '</strong>' +
            '</span>' +

            '<span>' +
            'Relevance: <strong>' +
            item.relevance +
            '%</strong>' +
            '</span>' +

            '<span>' +
            'Freshness: <strong>' +
            escapeHTML(item.freshness) +
            '</strong>' +
            '</span>' +

            '</div>';


        container.appendChild(card);
    });


    refreshIcons();
}


/* ================= REPORT ================= */

function renderReport(data) {

    const reportVerdict =
        document.getElementById("reportVerdict");

    const reportConfidence =
        document.getElementById("reportConfidence");

    const reportExplanation =
        document.getElementById("reportExplanation");

    const reportClaim =
        document.getElementById("reportClaim");

    const reportSimilarity =
        document.getElementById("reportSimilarity");


    if (reportVerdict) {
        reportVerdict.textContent =
            data.verdict;
    }

    if (reportConfidence) {
        reportConfidence.textContent =
            data.confidence + "%";
    }

    if (reportExplanation) {
        reportExplanation.textContent =
            data.explanation;
    }

    if (reportClaim) {
        reportClaim.textContent =
            "“" + data.claim + "”";
    }

    if (reportSimilarity) {
        reportSimilarity.textContent =
            data.similarity + "%";
    }


    const reportClaims =
        document.getElementById("reportClaims");


    if (!reportClaims) {
        return;
    }


    reportClaims.innerHTML = "";


    data.claims.forEach(function (claim) {

        const div =
            document.createElement("div");

        div.className =
            "report-claim";


        let statusColor = "#aa7713";

        if (claim.result === "SUPPORTED") {
            statusColor = "#16845d";
        } else if (claim.result === "CONTRADICTED") {
            statusColor = "#d1435b";
        }


        div.innerHTML =
            '<span>' +
            escapeHTML(claim.text) +
            '</span>' +

            '<strong class="report-claim-status" ' +
            'style="color:' +
            statusColor +
            '">' +
            escapeHTML(claim.result) +
            '</strong>';


        reportClaims.appendChild(div);
    });


    const reportTime =
        document.getElementById("reportTime");


    if (reportTime) {

        reportTime.textContent =
            new Date().toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    }


    refreshIcons();
}


/* ================= REVIEW ================= */

document.querySelectorAll(".decision-btn").forEach(function (button) {

    button.addEventListener("click", function () {

        document
            .querySelectorAll(".decision-btn")
            .forEach(function (btn) {
                btn.classList.remove("selected");
            });


        button.classList.add("selected");


        state.selectedDecision =
            button.dataset.decision;


        showToast(
            "Analyst decision selected."
        );
    });

});


/* ================= SAVE REVIEW ================= */

const saveReview =
    document.getElementById("saveReview");


if (saveReview) {

    saveReview.addEventListener("click", function () {

        if (!state.selectedDecision) {

            showToast(
                "Please select an analyst decision first."
            );

            return;
        }


        const notesElement =
            document.getElementById("analystNotes");


        const notes =
            notesElement
                ? notesElement.value.trim()
                : "";


        if (!notes) {

            showToast(
                "Add a short reasoning note before recording."
            );

            return;
        }


        const reviewSuccess =
            document.getElementById("reviewSuccess");


        if (reviewSuccess) {
            reviewSuccess.classList.remove("hidden");
        }


        showToast(
            "Analyst decision recorded."
        );


        refreshIcons();
    });

}


/* ================= PRINT ================= */

const printReport =
    document.getElementById("printReport");


if (printReport) {

    printReport.addEventListener("click", function () {
        window.print();
    });

}


/* ================= EXPLORE DEMO ================= */

const exploreDemo =
    document.getElementById("exploreDemo");


if (exploreDemo) {

    exploreDemo.addEventListener("click", function () {

        loadDemo("old");

        navigateTo("verify");

    });

}


/* ================= FILTER BUTTONS ================= */

document.querySelectorAll(".filter-btn").forEach(function (button) {

    button.addEventListener("click", function () {

        document
            .querySelectorAll(".filter-btn")
            .forEach(function (btn) {
                btn.classList.remove("active");
            });


        button.classList.add("active");


        const filter =
            button.textContent.trim();


        const cards =
            document.querySelectorAll(
                ".evidence-card"
            );


        cards.forEach(function (card) {

            const relationElement =
                card.querySelector(".relation");


            const relation =
                relationElement
                    ? relationElement.textContent
                        .trim()
                        .toLowerCase()
                    : "";


            if (filter === "All") {

                card.style.display =
                    "block";

            } else if (filter === "Supporting") {

                card.style.display =
                    relation === "supports"
                        ? "block"
                        : "none";

            } else if (filter === "Contradicting") {

                card.style.display =
                    relation === "contradicts"
                        ? "block"
                        : "none";
            }

        });

    });

});


/* ================= UTILITY ================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================= INITIALIZE ================= */

renderEvidence();

renderResults();

navigateTo("overview");

refreshIcons();