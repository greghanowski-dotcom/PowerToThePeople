import React, { useState } from 'react';
import '../styles/Survey.css'; // 🚀 CRITICAL LINK PERMANENTLY LOCKED IN GOING FORWARD

export default function Survey({ isLoggedIn, openModal }) {
    // Independent states to track the user's active selections
    const [trumpGrade, setTrumpGrade] = useState('');
    const [congressGrade, setCongressGrade] = useState('');
    const [gopGrade, setGopGrade] = useState('');
    const [demGrade, setDemGrade] = useState('');
    const [presidentMessage, setPresidentMessage] = useState('');
    const [economyRating, setEconomyRating] = useState('');
    const [selectedIssues, setSelectedIssues] = useState([]);
    const [personalReason, setPersonalReason] = useState(''); // 📝 Tracks open-ended personal reasoning

    const [isSubmitting, setIsLoading] = useState(false);
    const [surveyMessage, setSurveyMessage] = useState({ text: '', type: '' });

    const letterGrades = ['A', 'B', 'C', 'D', 'F'];
    const economyOptions = ['Excellent', 'Good', 'Fair', 'Poor'];

    // 🚀 FIXED STATE ARCHITECTURE: Aligned to match your loop parameters exactly!
    const [politicalIdentityLabel, setPoliticalIdentityLabel] = useState('');

    // Archetype description string options array
    const identityArchetypes = [
        "MAGA Republican", "Traditional Republican", "Conservative-leaning Independent",
        "Centrist or Moderate", "Libertarian", "Conservative Democrat",
        "Liberal or Progressive", "Something else"
    ];

    const civicIssuesOptions = [
        "Economy", "Cost of Living", "Crime", "Immigration & Border",
        "Election Integrity", "Energy", "Global Warming", "Spending & Debt",
        "National Security", "Education", "Healthcare", "Other"
    ];

    // 🗳️ QUESTION 9 STATE TRACKER:
    const [politicalIdentity, setPoliticalIdentity] = useState('');
    // Affiliation string array tokens
    const affiliationOptions = ['Republican', 'Democrat', 'Independent', 'Something else', 'Prefer not to say'];

    // 🗳️ QUESTION 11 STATE TRACKER:
    const [spendingCutOpinion, setSpendingCutOpinion] = useState('');

    // Scale tracking options array
    const agreementScaleOptions = ['Strongly agree', 'Agree', 'Neither', 'Disagree', 'Strongly disagree'];

    const [foreignWarsOpinion, setForeignWarsOpinion] = useState('');
    // 🗳️ QUESTION 13 STATE TRACKER:
    const [independentVoicesOpinion, setIndependentVoicesOpinion] = useState('');

    // 🗳️ QUESTION 14 STATE TRACKER:
    const [twoPartySystemView, setTwoPartySystemView] = useState('');

    // 🗳️ QUESTION 15 STATE TRACKER:
    const [politicsOutlook, setPoliticsOutlook] = useState('');

    // Outlook selection options array
    const outlookOptions = [
        "I've mostly given up on it",
        "I'm frustrated, but I think it can be fixed",
        "I'm hopeful about where things are going"
    ];
    // 🗳️ QUESTION 16 STATE TRACKER:
    const [trumpFrustrationReason, setTrumpFrustrationReason] = useState('');

    // Frustration selection options array
    const trumpFrustrationOptions = ["Too far", "Not far enough", "Both", "I'm not frustrated"];

    // 🗳️ QUESTION 17 STATE TRACKER:
    const [partyLean, setPartyLean] = useState('');

    // Lean selection options array
    const leanOptions = ["Lean Republican", "Lean Democrat", "No lean at all"];

    // 🗳️ QUESTION 18 STATE TRACKER:
    const [candidateSupport2026, setCandidateSupport2026] = useState('');

    // Selection choices array
    const support2026Options = ["The Republican", "The Democrat", "I wouldn't vote", "Depends on the candidates"];

    // 🗳️ QUESTION 19 STATE TRACKER:
    const [nonMemberReason, setNonMemberReason] = useState('');

    // 🗳️ QUESTION 20 STATE TRACKER:
    const [additionalComments, setAdditionalComments] = useState('');

    // View rating options array
    const systemViewOptions = ["It works well", "It's broken, but it can be fixed", "We need a new way"];
    const handleIssueToggleClick = (issue) => {
        if (isSubmitting) return;

        setSelectedIssues((prevChoices) => {
            if (prevChoices.includes(issue)) {
                return prevChoices.filter(item => item !== issue);
            }
            if (prevChoices.length >= 3) {
                return prevChoices;
            }
            return [...prevChoices, issue];
        });
    };

    const handleCastBallotSubmit = async (e) => {
        e.preventDefault();
        setSurveyMessage({ text: '', type: '' });

        if (!isLoggedIn) {
            if (typeof openModal === 'function') openModal('auth-gate');
            return;
        }

        // 🔒 CHECK VALIDATION: Ensures all 10 fields are evaluated completely
        if (!trumpGrade || !congressGrade || !gopGrade || !demGrade || !presidentMessage.trim() || !economyRating || selectedIssues.length !== 3 || !personalReason.trim() || !politicalIdentity || !politicalIdentityLabel) {
            return setSurveyMessage({ text: '❌ Please complete all questions and fill out both text comments to cast your vote.', type: 'error' });
        }

        setIsLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        try {
            const res = await fetch(`${baseUrl}/api/vote/cast-ballot-multi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: sessionStorage.getItem('currentUserId'),
                    votes: [
                        { issueId: 101, voteChoice: trumpGrade },
                        { issueId: 102, voteChoice: congressGrade },
                        { issueId: 103, voteChoice: gopGrade },
                        { issueId: 104, voteChoice: demGrade },
                        { issueId: 105, voteChoice: presidentMessage.trim() },
                        { issueId: 106, voteChoice: economyRating },
                        { issueId: 107, voteChoice: selectedIssues.join(', ') },
                        { issueId: 108, voteChoice: personalReason.trim() },
                        { issueId: 109, voteChoice: politicalIdentity },
                        { issueId: 110, voteChoice: politicalIdentityLabel },
                        { issueId: 111, voteChoice: spendingCutOpinion },
                        { issueId: 112, voteChoice: foreignWarsOpinion },
                        { issueId: 113, voteChoice: independentVoicesOpinion },
                        { issueId: 115, voteChoice: politicsOutlook },
                        { issueId: 106, voteChoice: trumpFrustrationReason },
                        { issueId: 117, voteChoice: partyLean },
                        { issueId: 118, voteChoice: candidateSupport2026 },
                        { issueId: 119, voteChoice: nonMemberReason.trim() },
                        { issueId: 120, voteChoice: additionalComments.trim() }
                    ]
                })
            });
            const data = await res.json();

            if (!res.ok) {
                return setSurveyMessage({ text: data.error || '❌ Ballot ledger submission failure.', type: 'error' });
            }

            setSurveyMessage({ text: '🎉 Secure ballots recorded successfully! Thank you for participating.', type: 'success' });
        } catch (error) {
            console.error('Survey transmission failure:', error);
            setSurveyMessage({ text: '❌ Local pipeline error. Ensure backend server is operational on port 5000.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="survey-container">
            <div className="survey-wrapper">
                <h1>Power to the People Survey</h1>
                <form onSubmit={handleCastBallotSubmit}>
                    {/* ==========================================
                       📝 QUESTION 1-4: GRADE SELECTIONS
                       ========================================== */}
                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">What grade would you give President Trump's job performance?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {letterGrades.map((grade) => (
                                <div key={`trump-${grade}`} onClick={() => !isSubmitting && setTrumpGrade(grade)} className={`survey-box-option ${trumpGrade === grade ? 'selected-box' : ''}`}>{grade}</div>
                            ))}
                        </div>
                        <div className="unsure-wrapper-row">
                            <div onClick={() => !isSubmitting && setTrumpGrade('Unsure')} className={`survey-box-option ${trumpGrade === 'Unsure' ? 'selected-box' : ''}`}>Unsure</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">What grade would you give Congress's job performance?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {letterGrades.map((grade) => (
                                <div key={`congress-${grade}`} onClick={() => !isSubmitting && setCongressGrade(grade)} className={`survey-box-option ${congressGrade === grade ? 'selected-box' : ''}`}>{grade}</div>
                            ))}
                        </div>
                        <div className="unsure-wrapper-row">
                            <div onClick={() => !isSubmitting && setCongressGrade('Unsure')} className={`survey-box-option ${congressGrade === 'Unsure' ? 'selected-box' : ''}`}>Unsure</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">What grade would you give the Republican Party?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {letterGrades.map((grade) => (
                                <div key={`gop-${grade}`} onClick={() => !isSubmitting && setGopGrade(grade)} className={`survey-box-option ${gopGrade === grade ? 'selected-box' : ''}`}>{grade}</div>
                            ))}
                        </div>
                        <div className="unsure-wrapper-row">
                            <div onClick={() => !isSubmitting && setGopGrade('Unsure')} className={`survey-box-option ${gopGrade === 'Unsure' ? 'selected-box' : ''}`}>Unsure</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">What grade would you give the Democratic Party?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {letterGrades.map((grade) => (
                                <div key={`dem-${grade}`} onClick={() => !isSubmitting && setDemGrade(grade)} className={`survey-box-option ${demGrade === grade ? 'selected-box' : ''}`}>{grade}</div>
                            ))}
                        </div>
                        <div className="unsure-wrapper-row">
                            <div onClick={() => !isSubmitting && setDemGrade('Unsure')} className={`survey-box-option ${demGrade === 'Unsure' ? 'selected-box' : ''}`}>Unsure</div>
                        </div>
                    </div>

                    {/* ==========================================
                       📝 QUESTION 5: OPEN TEXT MESSAGE FIELD BOX
                       ========================================== */}
                    <div style={{ marginBottom: '30px', width: '100%', boxSizing: 'border-box' }}>
                        <p className="survey-question-prompt">
                            If you could say one thing directly to the President, face-to-face, what would it be?
                        </p>
                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <textarea
                                className="survey-text-box"
                                placeholder="Type your message to the President here..."
                                value={presidentMessage}
                                onChange={(e) => setPresidentMessage(e.target.value)}
                                disabled={isSubmitting}
                                style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                    </div>
                    {/* ==========================================
                       🗳️ QUESTION 6: CURRENT ECONOMY RATING
                       ========================================== */}
                    <div style={{ marginBottom: '40px' }}>
                        <p className="survey-question-prompt">
                            How would you rate the current economy?
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {economyOptions.map((option) => (
                                <div key={`economy-${option}`} onClick={() => !isSubmitting && setEconomyRating(option)} className={`survey-box-option ${economyRating === option ? 'selected-box' : ''}`}>{option}</div>
                            ))}
                        </div>

                        <div className="unsure-wrapper-row">
                            <div onClick={() => !isSubmitting && setEconomyRating('Unsure')} className={`survey-box-option ${economyRating === 'Unsure' ? 'selected-box' : ''}`}>Unsure</div>
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 7: 3-ISSUE SELECTION WRAP PANEL
                       ========================================== */}
                    <div style={{ marginBottom: '40px', width: '100%', boxSizing: 'border-box' }}>
                        <p className="survey-question-prompt">
                            Which three issues matter most to you? <span style={{ fontWeight: 'normal', fontSize: '14px', color: '#64748b' }}>(Select exactly 3)</span>
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                            {civicIssuesOptions.map((issue) => {
                                const isSelected = selectedIssues.includes(issue);
                                return (
                                    <div key={`issue-${issue}`} onClick={() => handleIssueToggleClick(issue)} className={`survey-box-option ${isSelected ? 'selected-box' : ''}`} style={{ display: 'inline-flex', width: 'auto', minWidth: 'max-content', flex: '0 1 auto', padding: '10px 18px', fontSize: '14.5px', whiteSpace: 'nowrap', boxSizing: 'border-box', cursor: (!isSelected && selectedIssues.length >= 3) ? 'not-allowed' : 'pointer', opacity: (!isSelected && selectedIssues.length >= 3) ? 0.5 : 1 }}>{issue}</div>
                                );
                            })}
                        </div>
                    </div>


                    {/* ==========================================
                       📝 QUESTION 8: PERSONAL STATEMENT BOX
                       ========================================== */}
                    <div style={{ marginBottom: '30px', width: '100%', boxSizing: 'border-box' }}>
                        <p className="survey-question-prompt">
                            Why do these issues matter to you personally?
                        </p>
                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <textarea
                                className="survey-text-box"
                                placeholder="Type your personal statement here..."
                                value={personalReason}
                                onChange={(e) => setPersonalReason(e.target.value)}
                                disabled={isSubmitting}
                                style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 9: POLITICAL AFFILIATION IDENTITY
                       ========================================== */}
                    <div className="survey-section-block">
                        <p className="survey-question-prompt">
                            What do you identify as politically?
                        </p>

                        <div className="survey-issues-wrap-panel" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                            {affiliationOptions.map((identity) => {
                                return (
                                    <div
                                        onClick={() => !isSubmitting && setPoliticalIdentity(identity)}
                                        className={`survey-box-option ${politicalIdentity === identity ? 'selected-box' : ''}`}
                                        style={{ display: 'inline-flex', width: 'auto', minWidth: 'max-content', flex: '0 1 auto', padding: '10px 18px', fontSize: '14.5px', whiteSpace: 'nowrap', boxSizing: 'border-box' }}
                                    >
                                        {identity}
                                    </div>
                                );
                            })}
                        </div>
                    </div><br />

                    {/* ==========================================
                       🗳️ QUESTION 10: SPECIFIC ALIGNMENT ARCHETYPE
                       ========================================== */}
                    <div className="survey-section-block">
                        <p className="survey-question-prompt">
                            Which of these best describes you?
                        </p>
                        <div className="survey-issues-wrap-panel" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                            {identityArchetypes.map((archetype) => (
                                <div key={`archetype-${archetype}`} onClick={() => !isSubmitting && setPoliticalIdentityLabel(archetype)} className={`survey-box-option ${politicalIdentityLabel === archetype ? 'selected-box' : ''}`} style={{ display: 'inline-flex', width: 'auto', minWidth: 'max-content', flex: '0 1 auto', padding: '10px 18px', fontSize: '14.5px', whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
                                    {archetype}
                                </div>
                            ))}
                        </div>
                    </div><br />

                    {/* ==========================================
                       🗳️ QUESTION 11: GOVERNMENT SPENDING CUT OPINION
                       ========================================== */}
                    <div style={{ marginBottom: '30px' }}>
                        <p className="survey-question-prompt">
                            Agree or disagree: Government spending should be cut significantly?
                        </p>

                        {/* Renders options side-by-side using 5 clean grid boxes */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {agreementScaleOptions.map((option) => (
                                <div
                                    key={`spending-${option}`}
                                    onClick={() => !isSubmitting && setSpendingCutOpinion(option)}
                                    className={`survey-box-option ${spendingCutOpinion === option ? 'selected-box' : ''}`}
                                    style={{ fontSize: '13px', padding: '14px 4px', textAlign: 'center' }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* ==========================================
                       🗳️ QUESTION 12: FOREIGN WARS OPINION
                       ========================================== */}
                    <div style={{ marginBottom: '30px' }}>
                        <p className="survey-question-prompt">
                            Agree or disagree: The United States should stay out of foreign wars?
                        </p>

                        {/* Renders options side-by-side using 5 clean grid boxes */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {agreementScaleOptions.map((option) => (
                                <div
                                    key={`foreign-wars-${option}`}
                                    onClick={() => !isSubmitting && setForeignWarsOpinion(option)}
                                    className={`survey-box-option ${foreignWarsOpinion === option ? 'selected-box' : ''}`}
                                    style={{ fontSize: '13px', padding: '14px 4px', textAlign: 'center' }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* ==========================================
                       🗳️ QUESTION 13: INDEPENDENT VOICES IN CONGRESS OPINION
                       ========================================== */}
                    <div style={{ marginBottom: '30px' }}>
                        <p className="survey-question-prompt">
                            Agree or disagree: We need more independent voices in Congress?
                        </p>

                        {/* Renders options side-by-side using 5 clean grid boxes */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {agreementScaleOptions.map((option) => (
                                <div
                                    key={`independent-voices-${option}`}
                                    onClick={() => !isSubmitting && setIndependentVoicesOpinion(option)}
                                    className={`survey-box-option ${independentVoicesOpinion === option ? 'selected-box' : ''}`}
                                    style={{ fontSize: '13px', padding: '14px 4px', textAlign: 'center' }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* ==========================================
                       🗳️ QUESTION 14: TWO-PARTY SYSTEM EVALUATION
                       ========================================== */}
                    <div style={{ marginBottom: '30px' }}>
                        <p className="survey-question-prompt">
                            Which comes closest to your view of the two-party system?
                        </p>

                        {/* Renders the core views side-by-side in a responsive 3-column row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {systemViewOptions.map((option) => (
                                <div
                                    key={`system-view-${option}`}
                                    onClick={() => !isSubmitting && setTwoPartySystemView(option)}
                                    className={`survey-box-option ${twoPartySystemView === option ? 'selected-box' : ''}`}
                                    style={{ fontSize: '13px', padding: '14px 6px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>

                        {/* Full Width Unsure Button Box Container Row */}
                        <div className="unsure-wrapper-row">
                            <div
                                onClick={() => !isSubmitting && setTwoPartySystemView('Unsure')}
                                className={`survey-box-option ${twoPartySystemView === 'Unsure' ? 'selected-box' : ''}`}
                            >
                                Unsure
                            </div>
                        </div>
                    </div>
                    {/* ==========================================
                       🗳️ QUESTION 15: GENERAL POLITICS OUTLOOK
                       ========================================== */}
                    <div style={{ marginBottom: '30px' }}>
                        <p className="survey-question-prompt">
                            When it comes to politics, which comes closest?
                        </p>

                        {/* Renders the core outlook parameters side-by-side using 3 grid boxes */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {outlookOptions.map((option) => (
                                <div
                                    key={`outlook-${option}`}
                                    onClick={() => !isSubmitting && setPoliticsOutlook(option)}
                                    className={`survey-box-option ${politicsOutlook === option ? 'selected-box' : ''}`}
                                    style={{ fontSize: '13px', padding: '14px 6px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                        {/* ==========================================
                       🗳️ QUESTION 16: PRESIDENT TRUMP FRUSTRATION EVALUATION
                       ========================================== */}
                        <div style={{ marginBottom: '30px' }}>
                            <p className="survey-question-prompt">
                                When you're frustrated with President Trump, is it mostly because he's gone too far, or not far enough?
                            </p>

                            {/* Renders the core frustration metrics side-by-side using 4 grid boxes */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                                {trumpFrustrationOptions.map((option) => (
                                    <div
                                        key={`trump-frustration-${option}`}
                                        onClick={() => !isSubmitting && setTrumpFrustrationReason(option)}
                                        className={`survey-box-option ${trumpFrustrationReason === option ? 'selected-box' : ''}`}
                                        style={{ fontSize: '13px', padding: '14px 4px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* ==========================================
                       🗳️ QUESTION 17: INDEPENDENT PARTY LEAN EVALUATION
                       ========================================== */}
                        <div style={{ marginBottom: '30px' }}>
                            <p className="survey-question-prompt">
                                If you're not a member of the Democratic or Republican parties, do you lean toward either party, even a little?
                            </p>

                            {/* Renders the core lean options side-by-side using 3 grid boxes */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                                {leanOptions.map((option) => (
                                    <div
                                        key={`lean-${option}`}
                                        onClick={() => !isSubmitting && setPartyLean(option)}
                                        className={`survey-box-option ${partyLean === option ? 'selected-box' : ''}`}
                                 style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                                   >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* ==========================================
                       🗳️ QUESTION 18: 2026 CANDIDATE SUPPORT SIMULATION
                       ========================================== */}
                        <div style={{ marginBottom: '30px' }}>
                            <p className="survey-question-prompt">
                                If your choices in 2026 came down to an independent-leaning Republican and a progressive Democrat, who would you likely support?
                            </p>

                            {/* Renders the core options side-by-side using 4 grid boxes */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                                {support2026Options.map((option) => (
                                    <div
                                        key={`support-2026-${option}`}
                                        onClick={() => !isSubmitting && setCandidateSupport2026(option)}
                                        className={`survey-box-option ${candidateSupport2026 === option ? 'selected-box' : ''}`}
                                        style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Full Width Unsure Button Box Container Row */}
                        <div className="unsure-wrapper-row">
                            <div
                                onClick={() => !isSubmitting && setPoliticsOutlook('Unsure')}
                                className={`survey-box-option ${politicsOutlook === 'Unsure' ? 'selected-box' : ''}`}
                            >
                                Unsure
                            </div>
                        </div>
                    </div>
                    {/* ==========================================
                       📝 QUESTION 19: REASON FOR NON-MEMBERSHIP STATEMENT BOX
                       ========================================== */}
                    <div style={{ marginBottom: '30px', width: '100%', boxSizing: 'border-box' }}>
                        <p className="survey-question-prompt">
                            If you're not a member of the Democratic or Republican parties, why not?
                        </p>
                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <textarea
                                className="survey-text-box"
                                placeholder="Type your response here..."
                                value={nonMemberReason}
                                onChange={(e) => setNonMemberReason(e.target.value)}
                                disabled={isSubmitting}
                                required
                                style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                    {/* ==========================================
                       📝 QUESTION 20: ADDITIONAL COMMENTS STATEMENT BOX
                       ========================================== */}
                    <div style={{ marginBottom: '30px', width: '100%', boxSizing: 'border-box' }}>
                        <p className="survey-question-prompt">
                            Is there anything else you would like to share?
                        </p>
                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <textarea
                                className="survey-text-box"
                                placeholder="Type any additional comments here..."
                                value={additionalComments}
                                onChange={(e) => setAdditionalComments(e.target.value)}
                                disabled={isSubmitting}
                                required
                                style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="survey-submit-btn"
                        disabled={isSubmitting}
                        style={{ marginTop: '10px' }}
                    >
                        {isSubmitting ? 'Recording Ballots...' : 'Submit Secure Votes'}
                    </button>
                </form>
            </div>
        </div>
    );
}

