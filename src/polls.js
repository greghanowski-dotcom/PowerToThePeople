const appState = {};
let activeIssueId = null;

const politicalIssues = [
  {
    id: 2,
    title: "Carbon Tax on Imports",
    desc: "Should the country enact tariff penalties on heavy industrial goods imported from nations failing to meet standard climate benchmarks?",
    for: "Protects native manufacturing clean-tech investments and incentivizes polluting nations to clean up their supply chains.",
    against: "Likely to drive up consumer prices on everyday items and risk starting global trade retaliations or economic wars."
  },
  {
    id: 3,
    title: "Federal Term Limits",
    desc: "Should constitutional rules limit supreme court judges and federal congress members to structured term ceilings rather than lifetime appointments?",
    for: "Encourages systemic legislative turnover, dampens long-term corruption, and introduces modern, generational viewpoints.",
    against: "Loses essential historical legislative experience and amplifies reliance on unelected backroom corporate lobbyists."
  },
  {
    id: 4,
    title: "AI & Automation Tax",
    desc: "Should corporations deployment of custom workflow automation models be taxed to fund alternative workforce upskilling systems?",
    for: "Prevents immediate tax revenue loss from automation while directly investing resources back into manual transition paths.",
    against: "Stifles structural efficiency developments, encouraging firms to move processing assets to alternative lax tech-havens."
  },
  {
    id: 5,
    title: "Decentralized Medical Insurance",
    desc: "Should the existing public-private healthcare system be replaced with universal, single-payer base coverage managed by state-level pools?",
    for: "Eradicates medical bankruptcy, dramatically cuts marketing waste, and standardizes baseline preventative care coverage for all.",
    against: "Could increase mid-tier tax rates significantly, threaten specialized medical R&D investments, and lead to longer wait times for non-urgent surgeries."
  },
  {
    id: 6,
    title: "Global Warming & Global Carbon Cap",
    desc: "Should the government mandate legally binding annual emission reductions on high-polluting domestic industries to achieve net-zero targets by 2040?",
    for: "Dramatically accelerates transition into clean infrastructure, prevents catastrophic temperature spikes, and mitigates long-term economic disaster costs.",
    against: "Imposes harsh regulatory overhead that risks localized manufacturing jobs, raises immediate utility pricing, and diminishes competitive leverage if global rivals fail to conform to identical strict limitations."
  },
  {
    id: 7,
    title: "Balanced Budget Amendment & National Debt",
    desc: "Should a constitutional amendment legally prohibit the federal government from passing deficit budgets except during formally declared times of war?",
    for: "Forces long-term fiscal discipline, curbs spiraling national debt, protects future generations from hyperinflation, and stabilizes currency value.",
    against: "Strips the government of critical emergency spending leverage required to handle economic recessions, infrastructure failures, or public health crises."
  },
  {
    id: 8,
    title: "Federal Abortion Restrictions Bill",
    desc: "Should Congress pass a federal law making abortion illegal nationwide, with explicit exceptions limited only to cases where the mother's life is in danger?",
    for: "Establishes a uniform federal standard regarding the legal rights of the unborn and protects human life consistently across state lines.",
    against: "Infringes on individual reproductive autonomy, overrides the legislative authority of individual states to determine localized laws, and complicates emergency medical interventions."
  },
  {
    id: 9,
    title: "High-Income Tax Bracket Increase",
    desc: "Should the federal government raise the marginal income tax rate specifically for individuals earning over $400,000 annually to fund infrastructure and social programs?",
    for: "Generates significant public revenue from those with the highest capacity to pay, helps reduce wealth inequality, and reduces the national deficit.",
    against: "Could reduce the incentive for economic investment, discourage high-earning professionals, and encourage aggressive tax avoidance strategies."
  },
  {
    id: 10,
    title: "Proportional Flat Tax Initiative",
    desc: "Should the federal government eliminate the complex, multi-tiered tax code and establish a single flat tax rate applicable to all citizens and corporations to enforce an equal sharing of the tax burden?",
    for: "Removes complex legal loopholes, strips out expensive compliance overhead, simplifies annual individual filing to a single step, and ensures everyone pays an identical proportion.",
    against: "Imposes a heavier practical financial burden on lower-income households who spend a higher share of earnings on basic living assets compared to wealthy individuals."
  }
];

// Add this state object at the top of poll.js
const pollState = {
  1: { discussed: false, voted: false },
  2: { discussed: false, voted: false }
};

window.viewDiscussion = function (id) {
  const area = document.getElementById(`discussion-area-${id}`);
  const voteBtn = document.getElementById(`vote-btn-${id}`);

  // Toggle area
  area.style.display = area.style.display === 'none' ? 'block' : 'none';

  // Mark as visited and enable Vote button
  pollState[id].discussed = true;
  voteBtn.disabled = false;
};

// You'll need to call this function when the user finishes their vote
window.completeVote = function (id) {
  const consBtn = document.getElementById(`cons-btn-${id}`);

  // Mark as voted and enable Consensus button
  pollState[id].voted = true;
  consBtn.disabled = false;

  // Close your modal here
  closeModal('voteModal');
};

// Simple handler for your new Discussion button
function viewDiscussion(id) {
  const area = document.getElementById(`discussion-area-${id}`);
  const text = document.getElementById(`argsText-${id}`);

  // Toggle visibility
  if (area.style.display === 'none') {
    area.style.display = 'block';
    text.innerText = "Here is the consolidated argument text for issue " + id + ".";
  } else {
    area.style.display = 'none';
  }
}

function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function toggleProfileDropdown() {
  document.getElementById('profileDropdown').classList.toggle('show');
}

window.onclick = function (event) {
  if (!event.target.matches('.profile-trigger')) {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown && dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  }
}

function toggleSignIn(signedIn) {
  const signInBtn = document.getElementById('signInBtn');
  if (signedIn) {
    signInBtn.style.display = 'none';
  } else {
    signInBtn.style.display = 'block';
  }
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown.classList.contains('show')) dropdown.classList.remove('show');
}

function viewArgument(id, side) {
  const issue = politicalIssues.find(i => i.id === id);
  if (side === 'for') {
    document.getElementById('argsForText').innerText = issue.for;
    appState[id].visitedFor = true;
    openModal('argsForModal');
  } else {
    document.getElementById('argsAgainstText').innerText = issue.against;
    appState[id].visitedAgainst = true;
    openModal('argsAgainstModal');
  }
  checkUnlocks(id);
}

function checkUnlocks(id) {
  if (appState[id].visitedFor && appState[id].visitedAgainst) {
    document.getElementById(`vote-btn-${id}`).disabled = false;
    document.getElementById(`cons-btn-${id}`).disabled = false;
  }
}

// Add this new variable
let currentVoteId = null;

// Update your openVoteDialog to capture the ID
window.openVoteDialog = function (id) {
  currentVoteId = id; // Store which issue we are voting on

  // Update the modal text if you have a display element
  const questionText = document.getElementById('voteQuestionText');
  if (questionText) {
    questionText.innerText = `Casting vote for: Issue #${id}`;
  }

  openModal('voteModal');
};

// Update your existing completeVote to use that variable
window.completeVote = function () {
  if (currentVoteId === null) return;

  const consBtn = document.getElementById(`cons-btn-${currentVoteId}`);

  // Mark as voted and enable Consensus button
  pollState[currentVoteId].voted = true;
  consBtn.disabled = false;

  closeModal('voteModal');
  currentVoteId = null; // Reset it
};

function submitVote() {
  closeModal('voteModal');
  alert("Thank you! Your vote has been logged securely.");
}

// Append this function to the bottom of your app.js file

function filterStats() {
  // Pull values from active rows to determine context
  const selectedScope = document.querySelector('input[name="scopeOpt"]:checked').value;

  const sa = document.getElementById('stat-sa');
  const a = document.getElementById('stat-a');
  const n = document.getElementById('stat-n');
  const d = document.getElementById('stat-d');
  const sd = document.getElementById('stat-sd');

  if (selectedScope === 'overall') {
    sa.innerText = "34%";
    a.innerText = "22%";
    n.innerText = "14%";
    d.innerText = "18%";
    sd.innerText = "12%";
  } else {
    // Generate distinct varied statistics shifts simulating real filter results
    sa.innerText = "45%";
    a.innerText = "15%";
    n.innerText = "10%";
    d.innerText = "20%";
    sd.innerText = "10%";
  }
}

// Switches the layout state between "Overall" and "By Demographics" modes
function toggleDemoRows() {
  const selectedScope = document.querySelector('input[name="scopeOpt"]:checked').value;
  const targetRows = document.querySelectorAll('.demo-toggle-row');

  if (selectedScope === 'overall') {
    targetRows.forEach(row => {
      row.classList.add('disabled');
      // Uncheck and disable individual input elements inside row
      row.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.disabled = true;
        radio.checked = false;
      });
    });
    resetToDefaultStats();
  } else {
    targetRows.forEach(row => {
      row.classList.remove('disabled');
      row.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.disabled = false;
      });
    });
  }
}

// Generates dynamic data changes when options are checked
function filterStats() {
  const sa = document.getElementById('stat-sa');
  const a = document.getElementById('stat-a');
  const n = document.getElementById('stat-n');
  const d = document.getElementById('stat-d');
  const sd = document.getElementById('stat-sd');

  // Variations simulating live calculation transformations
  sa.innerText = "42%";
  a.innerText = "18%";
  n.innerText = "12%";
  d.innerText = "20%";
  sd.innerText = "8%";
}

function resetToDefaultStats() {
  document.getElementById('stat-sa').innerText = "34%";
  document.getElementById('stat-a').innerText = "22%";
  document.getElementById('stat-n').innerText = "14%";
  document.getElementById('stat-d').innerText = "18%";
  document.getElementById('stat-sd').innerText = "12%";
}

// State tracker extension to follow login status
let isLoggedIn = false;

function toggleSignIn(signedIn) {
  const signInBtn = document.getElementById('signInBtn');
  const profileTriggerBtn = document.getElementById('profileTriggerBtn');

  if (signedIn) {
    signInBtn.style.display = 'none';
    // Enable profile icon button and restore full opacity
    profileTriggerBtn.disabled = false;
    profileTriggerBtn.classList.remove('disabled');
  } else {
    signInBtn.style.display = 'block';
    // Disable profile icon button and apply visual transparency
    profileTriggerBtn.disabled = true;
    profileTriggerBtn.classList.add('disabled');
  }

  // Close the dropdown menu if it happens to be open
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown && dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
  }
}

// Validation wrapper guarding manual attempts
function openProfileModal() {
  if (!isLoggedIn) return;
  openModal('profileModal');
}

window.viewDiscussion = function (id) {
  const modal = document.getElementById('discussionModal');
  const forText = document.getElementById('argsForText');
  const againstText = document.getElementById('argsAgainstText');

  // In a real app, you would fetch these from your data source using the ID
  forText.innerText = "UBI reduces income inequality and provides a safety net during automation-driven job loss.";
  againstText.innerText = "UBI may reduce work incentives, lead to inflation, and is extremely expensive to fund.";

  // Open the modal
  modal.classList.add('show');

  // Enable the Vote button as the requirement states
  const voteBtn = document.getElementById(`vote-btn-${id}`);
  if (voteBtn) {
    voteBtn.disabled = false;
  }
};
/*
function toggleAccordion(btn) {
    console.log("toggleAccordion was hit");
    
    try {
        btn.classList.toggle("active");
        var panel = btn.nextElementSibling;
        
        // Debugging: Check if panel exists
        if (!panel) {
            console.error("CRITICAL ERROR: No panel found next to:", btn);
            return;
        }

        if (panel.style.maxHeight && panel.style.maxHeight !== "0px") {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
        
        console.log("Toggle executed for:", btn.innerText);
    } catch (e) {
        console.error("Function crashed:", e);
    }
}
*/

// Modal Logic
function openVoteModal(id) {
  const issue = politicalIssues.find(item => item.id === id);
  if (issue) {
    document.getElementById('modalTitle').innerText = issue.title;
    document.getElementById('voteQuestionText').innerText = issue.desc;
    document.getElementById('argsFor').innerText = issue.for;
    document.getElementById('argsAgainst').innerText = issue.against;
    document.getElementById('voteModal').style.display = 'block';
  }
}
/*
function renderPolls() {
    const container = document.getElementById('issuesContainer');
    if (!container) return;

    // 1. Clear old content
    container.innerHTML = '';
    
    // 2. Add the items
    politicalIssues.forEach(issue => {
        container.insertAdjacentHTML('beforeend', `
            <button class="accordion">${issue.title}</button>
            <div class="panel">
                <p>${issue.desc}</p>
                <button class="vote-btn" onclick="openVoteModal(${issue.id})">Vote</button>
            </div>
        `);
    });

    // 3. Attach the click listener to the container (Event Delegation)
    // This runs ONCE, and it replaces any old listener attached to this specific container
    container.onclick = function(e) {
        if (e.target.classList.contains('accordion')) {
            const btn = e.target;
            const panel = btn.nextElementSibling;

            // Toggle state
            btn.classList.toggle("active");

            if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
                panel.style.maxHeight = '0px';
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        }
    };
}
*/
/*
function renderPolls() {
 const container = document.getElementById('issuesContainer');
 if (!container) return;

 politicalIssues.forEach(issue => {
     const div = document.createElement('div');
     div.innerHTML = `
         <button class="accordion">${issue.title}</button>
         <div class="panel">
             <p>${issue.desc}</p>
             <button class="vote-btn" onclick="openVoteModal(${issue.id})">Vote</button>
         </div>
     `;
     // Append child instead of insertAdjacentHTML to let the DOM engine 
     // properly register the new elements
     while (div.firstChild) {
         container.appendChild(div.firstChild);
     }
 });
}
 */
/*
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}
  */
// Remove any old event listener before adding a new one
// We use a named function so we can remove it
// 1. The named function that handles ALL accordion clicks
function handleAccordionClick(e) {
    const btn = e.target;
    
    // Only proceed if the clicked element is actually an accordion
    if (!btn.classList.contains('accordion')) return;
    
    const panel = btn.nextElementSibling;
    btn.classList.toggle("active");
    
    // Get the actual height from the browser
    const computedHeight = window.getComputedStyle(panel).maxHeight;

    if (computedHeight !== '0px') {
        // Close
        panel.style.setProperty('max-height', '0px', 'important');
    } else {
        // Open
        panel.style.setProperty('max-height', panel.scrollHeight + 'px', 'important');
    }
}

// Cleanup and attach
document.removeEventListener('click', handleAccordionClick);
document.addEventListener('click', handleAccordionClick);

// 3. Your render function
function renderPolls() {
    const container = document.getElementById('issuesContainer');
    if (!container) return;

    container.innerHTML = '';
    politicalIssues.forEach(issue => {
        container.insertAdjacentHTML('beforeend', `
            <button class="accordion">${issue.title}</button>
            <div class="panel">
                <p>${issue.desc}</p>
                <button class="vote-btn" onclick="openVoteModal(${issue.id})">Vote</button>
            </div>
        `);
    });
}

console.log("polls.js loaded");
