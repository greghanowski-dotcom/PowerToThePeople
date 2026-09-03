import React, { useState, useEffect } from 'react';
import '../styles/Survey.css'; // 🚀 CRITICAL LINK PERMANENTLY LOCKED IN GOING FORWARD

export default function Survey({ isLoggedIn, openModal }) {
    // 🔌 LOCALSTORAGE STATE DETECTOR LANE: Pulls previous answers if they exist
    const getSaved = (key, fallback = '') => localStorage.getItem(`survey_${key}`) || fallback;
    const getSavedJson = (key, fallback = []) => {
        const data = localStorage.getItem(`survey_${key}`);
        return data ? JSON.parse(data) : fallback;
    };

    // Independent states to track the user's active selections
    const [trumpGrade, setTrumpGrade] = useState(() => getSaved('trumpGrade'));
    const [congressGrade, setCongressGrade] = useState(() => getSaved('congressGrade'));
    const [gopGrade, setGopGrade] = useState(() => getSaved('gopGrade'));
    const [demGrade, setDemGrade] = useState(() => getSaved('demGrade'));
    const [presidentMessage, setPresidentMessage] = useState(() => getSaved('presidentMessage'));
    const [economyRating, setEconomyRating] = useState(() => getSaved('economyRating'));
    const [selectedIssues, setSelectedIssues] = useState(() => getSavedJson('selectedIssues'));
    const [personalReason, setPersonalReason] = useState(() => getSaved('personalReason'));
    const [politicalIdentity, setPoliticalIdentity] = useState(() => getSaved('politicalIdentity'));
    const [politicalIdentityLabel, setPoliticalIdentityLabel] = useState(() => getSaved('politicalIdentityLabel'));
    const [spendingCutOpinion, setSpendingCutOpinion] = useState(() => getSaved('spendingCutOpinion'));
    const [foreignWarsOpinion, setForeignWarsOpinion] = useState(() => getSaved('foreignWarsOpinion'));
    const [independentVoicesOpinion, setIndependentVoicesOpinion] = useState(() => getSaved('independentVoicesOpinion'));
    const [twoPartySystemView, setTwoPartySystemView] = useState(() => getSaved('twoPartySystemView'));
    const [politicsOutlook, setPoliticsOutlook] = useState(() => getSaved('politicsOutlook'));
    const [trumpFrustrationReason, setTrumpFrustrationReason] = useState(() => getSaved('trumpFrustrationReason'));
    const [partyLean, setPartyLean] = useState(() => getSaved('partyLean'));
    const [candidateSupport2026, setCandidateSupport2026] = useState(() => getSaved('candidateSupport2026'));
    const [nonMemberReason, setNonMemberReason] = useState(() => getSaved('nonMemberReason'));
    const [additionalComments, setAdditionalComments] = useState(() => getSaved('additionalComments'));
    
    const [isSubmitting, setIsLoading] = useState(false);
    const [surveyMessage, setSurveyMessage] = useState({ text: '', type: '' });

    const letterGrades = ['A', 'B', 'C', 'D', 'F'];
    const economyOptions = ['Excellent', 'Good', 'Fair', 'Poor'];
    const identityArchetypes = [
        "MAGA Republican", 
        "Traditional Republican", 
        "Conservative-leaning Independent",
        "Centrist or Moderate", 
        "Libertarian", 
        "Conservative Democrat",
        "Liberal or Progressive", 
        "Something else"
    ];
    const affiliationOptions = ['Republican', 'Democrat', 'Independent', 'Something else', 'Prefer not to say'];
    const agreementScaleOptions = ['Strongly agree', 'Agree', 'Neither', 'Disagree', 'Strongly disagree'];
    const systemViewOptions = ["It works well", "It's broken, but it can be fixed", "We need a new way"];
    const outlookOptions = ["I've mostly given up on it", "I'm frustrated, but I think it can be fixed", "I'm hopeful about where things are going"];
    const trumpFrustrationOptions = ["Too far", "Not far enough", "Both", "I'm not frustrated"];
    const leanOptions = ["Lean Republican", "Lean Democrat", "No lean at all"];
    const support2026Options = ["The Republican", "The Democrat", "I wouldn't vote", "Depends on the candidates"];
    
    const civicIssuesOptions = [
        "Economy", "Cost of Living", "Crime", "Immigration & Border", 
        "Election Integrity", "Energy", "Global Warming", "Spending & Debt", 
        "National Security", "Education", "Healthcare", "Other"
    ];

    // 🚀 AUTOMATIC REAL-TIME SAVING PIPELINE
    useEffect(() => { localStorage.setItem('survey_trumpGrade', trumpGrade); }, [trumpGrade]);
    useEffect(() => { localStorage.setItem('survey_congressGrade', congressGrade); }, [congressGrade]);
    useEffect(() => { localStorage.setItem('survey_gopGrade', gopGrade); }, [gopGrade]);
    useEffect(() => { localStorage.setItem('survey_demGrade', demGrade); }, [demGrade]);
    useEffect(() => { localStorage.setItem('survey_presidentMessage', presidentMessage); }, [presidentMessage]);
    useEffect(() => { localStorage.setItem('survey_economyRating', economyRating); }, [economyRating]);
    useEffect(() => { localStorage.setItem('survey_selectedIssues', JSON.stringify(selectedIssues)); }, [selectedIssues]);
    useEffect(() => { localStorage.setItem('survey_personalReason', personalReason); }, [personalReason]);
    useEffect(() => { localStorage.setItem('survey_politicalIdentity', politicalIdentity); }, [politicalIdentity]);
    useEffect(() => { localStorage.setItem('survey_politicalIdentityLabel', politicalIdentityLabel); }, [politicalIdentityLabel]);
    useEffect(() => { localStorage.setItem('survey_spendingCutOpinion', spendingCutOpinion); }, [spendingCutOpinion]);
    useEffect(() => { localStorage.setItem('survey_foreignWarsOpinion', foreignWarsOpinion); }, [foreignWarsOpinion]);
    useEffect(() => { localStorage.setItem('survey_independentVoicesOpinion', independentVoicesOpinion); }, [independentVoicesOpinion]);
    useEffect(() => { localStorage.setItem('survey_twoPartySystemView', twoPartySystemView); }, [twoPartySystemView]);
    useEffect(() => { localStorage.setItem('survey_politicsOutlook', politicsOutlook); }, [politicsOutlook]);
    useEffect(() => { localStorage.setItem('survey_trumpFrustrationReason', trumpFrustrationReason); }, [trumpFrustrationReason]);
    useEffect(() => { localStorage.setItem('survey_partyLean', partyLean); }, [partyLean]);
    useEffect(() => { localStorage.setItem('survey_candidateSupport2026', candidateSupport2026); }, [candidateSupport2026]);
    useEffect(() => { localStorage.setItem('survey_nonMemberReason', nonMemberReason); }, [nonMemberReason]);
    useEffect(() => { localStorage.setItem('survey_additionalComments', additionalComments); }, [additionalComments]);

    // Determines if any single input field contains data to validate partial updates
    const hasAnyResponse = trumpGrade || congressGrade || gopGrade || demGrade || presidentMessage.trim() || 
                           economyRating || selectedIssues.length > 0 || personalReason.trim() || politicalIdentity || 
                           politicalIdentityLabel || spendingCutOpinion || foreignWarsOpinion || independentVoicesOpinion || 
                           twoPartySystemView || politicsOutlook || trumpFrustrationReason || partyLean || 
                           candidateSupport2026 || nonMemberReason.trim() || additionalComments.trim();

    const handleIssueToggleClick = (issue) => {
        if (isSubmitting) return;
        setSelectedIssues((prevChoices) => {
            if (prevChoices.includes(issue)) return prevChoices.filter(item => item !== issue);
            if (prevChoices.length >= 3) return prevChoices; 
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

        // 🔒 LIBERATED VALIDATION CHECK: Only rejects if the form is completely empty
        if (!hasAnyResponse) {
            return setSurveyMessage({ text: '❌ Please complete at least one question before submitting your partial response.', type: 'error' });
        }

        setIsLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        // Filters out empty answers dynamically so your database rows don't get junk entries
        const activeVotes = [
            { issueId: 101, val: trumpGrade }, { issueId: 102, val: congressGrade },
            { issueId: 103, val: gopGrade }, { issueId: 104, val: demGrade },
            { issueId: 105, val: presidentMessage.trim() }, { issueId: 106, val: economyRating },
            { issueId: 107, val: selectedIssues.join(', ') }, { issueId: 108, val: personalReason.trim() },
            { issueId: 109, val: politicalIdentity }, { issueId: 110, val: politicalIdentityLabel },
            { issueId: 111, val: spendingCutOpinion }, { issueId: 112, val: foreignWarsOpinion },
            { issueId: 113, val: independentVoicesOpinion }, { issueId: 114, val: twoPartySystemView },
            { issueId: 115, val: politicsOutlook }, { issueId: 116, val: trumpFrustrationReason },
            { issueId: 117, val: partyLean }, { issueId: 118, val: candidateSupport2026 },
            { issueId: 119, val: nonMemberReason.trim() }, { issueId: 120, val: additionalComments.trim() }
        ].filter(item => item.val !== '' && item.val !== '[]');

        try {
            const res = await fetch(`${baseUrl}/api/cast-ballot-multi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: sessionStorage.getItem('currentUserId'),
                    userChoices: activeVotes.map(v => ({ issueId: v.issueId, userChoices: v.val }))
                })
            });
            const data = await res.json();
            if (!res.ok) return setSurveyMessage({ text: data.error || '❌ Ballot submission failure.', type: 'error' });

            setSurveyMessage({ text: '🎉 Survey response recorded successfully! Thank you for participating.', type: 'success' });
            
            // Clear local cache cleanly after successful submission
            localStorage.clear();
        } catch (error) {
            console.error('Survey transmission failure:', error);
setSurveyMessage({ text: '❌ Local pipeline error. Ensure backend server is operational on port 5000.', type: 'error' });} finally {setIsLoading(false);}};

 return (
        <div className="survey-page-container">
            {/* 🚀 FIXED INTRO NOTICE CARD CONTAINER: Positioned cleanly before all questions */}
            <div className="survey-card-notice">
                <p className="survey-notice-text">
                    All questions are optional. You may submit a partial response.
                </p>
            </div>

            <div className="survey-wrapper">
                <h1>Power to the People Survey</h1>
                
                {surveyMessage.text && (
                    <div className={`auth-alert-banner ${surveyMessage.type}`} style={{ textAlign: 'center' }}>
                        {surveyMessage.text}
                    </div>
                )}

                <form onSubmit={handleCastBallotSubmit}>
                    
                    {/* ==========================================
                       🗳️ QUESTION 1: PRESIDENT TRUMP EVALUATION CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>What grade would you give President Trump's job performance?</strong>
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {letterGrades.map((grade) => (
                                <div key={`trump-${grade}`} onClick={() => !isSubmitting && setTrumpGrade(grade)} className={`survey-box-option ${trumpGrade === grade ? 'selected-box' : ''}`}>{grade}</div>
                            ))}
                        </div>
                        <div className="unsure-wrapper-row">
                            <div onClick={() => !isSubmitting && setTrumpGrade('Unsure')} className={`survey-box-option ${trumpGrade === 'Unsure' ? 'selected-box' : ''}`}>Unsure</div>
                        </div>
                    </div>                   
                    {/* ==========================================
                       🗳️ QUESTION 2: US CONGRESS CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>What grade would you give Congress's job performance?</strong>
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {letterGrades.map((grade) => (
                                <div key={`congress-${grade}`} onClick={() => !isSubmitting && setCongressGrade(grade)} className={`survey-box-option ${congressGrade === grade ? 'selected-box' : ''}`}>{grade}</div>
                            ))}
                        </div>
                        <div className="unsure-wrapper-row">
                            <div onClick={() => !isSubmitting && setCongressGrade('Unsure')} className={`survey-box-option ${congressGrade === 'Unsure' ? 'selected-box' : ''}`}>Unsure</div>
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 3: REPUBLICAN PARTY CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>What grade would you give the Republican Party?</strong>
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {letterGrades.map((grade) => (
                                <div key={`gop-${grade}`} onClick={() => !isSubmitting && setGopGrade(grade)} className={`survey-box-option ${gopGrade === grade ? 'selected-box' : ''}`}>{grade}</div>
                            ))}
                        </div>
                        <div className="unsure-wrapper-row">
                            <div onClick={() => !isSubmitting && setGopGrade('Unsure')} className={`survey-box-option ${gopGrade === 'Unsure' ? 'selected-box' : ''}`}>Unsure</div>
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 4: DEMOCRATIC PARTY CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>What grade would you give the Democratic Party?</strong>
                        </h4>
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
                       📝 QUESTION 5: MESSAGE TO THE PRESIDENT CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>If you could say one thing directly to the President, face-to-face, what would it be?</strong>
                        </h4>
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
                       🗳️ QUESTION 6: CURRENT ECONOMY RATING CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>How would you rate the current economy?</strong>
                        </h4>
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
                       🗳️ QUESTION 7: 3-ISSUE SELECTION CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>Which three issues matter most to you?</strong> <span style={{ fontWeight: 'normal', fontSize: '14px', color: '#64748b' }}>(Select exactly 3)</span>
                        </h4>
                        <div className="survey-issues-wrap-panel">
                            {civicIssuesOptions.map((issue) => {
                                const isSelected = selectedIssues.includes(issue);
                                return (
                                    <div 
                                        key={`issue-${issue}`} 
                                        onClick={() => handleIssueToggleClick(issue)} 
                                        className={`survey-box-option survey-issue-flex-box ${isSelected ? 'selected-box' : ''}`}
                                    >
                                        {issue}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* ==========================================
                       📝 QUESTION 8: PERSONAL STATEMENT CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>Why do these issues matter to you personally?</strong>
                        </h4>
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
                       🗳️ QUESTION 9: POLITICAL AFFILIATION CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>What do you identify as politically?</strong>
                        </h4>
                        <div className="survey-issues-wrap-panel">
                            {affiliationOptions.map((identity) => (
                                <div
                                    key={`affiliation-${identity}`}
                                    onClick={() => !isSubmitting && setPoliticalIdentity(identity)}
                                    className={`survey-box-option survey-issue-flex-box ${politicalIdentity === identity ? 'selected-box' : ''}`}
                                >
                                    {identity}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* ==========================================
                       🗳️ QUESTION 10: SPECIFIC ALIGNMENT ARCHETYPE CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>Which of these best describes you?</strong>
                        </h4>
                        <div className="survey-issues-wrap-panel" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                            {/* 🚀 FIXED: Array tracking name synced to match identityArchetypes precisely! */}
                            {identityArchetypes.map((archetype) => (
                                <div 
                                    key={`archetype-${archetype}`} 
                                    onClick={() => !isSubmitting && setPoliticalIdentityLabel(archetype)} 
                                    className={`survey-box-option survey-issue-flex-box ${politicalIdentityLabel === archetype ? 'selected-box' : ''}`}
                                    style={{ display: 'inline-flex', width: 'auto', minWidth: 'max-content', flex: '0 1 auto', padding: '10px 18px', fontSize: '14.5px', whiteSpace: 'nowrap', boxSizing: 'border-box' }}
                                >
                                    {archetype}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* ==========================================
                       🗳️ QUESTION 11: GOVERNMENT SPENDING CUT OPINION CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>Agree or disagree: Government spending should be cut significantly?</strong>
                        </h4>
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
                       🗳️ QUESTION 12: FOREIGN WARS OPINION CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>Agree or disagree: The United States should stay out of foreign wars?</strong>
                        </h4>
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
                       🗳️ QUESTION 13: INDEPENDENT VOICES CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>Agree or disagree: We need more independent voices in Congress?</strong>
                        </h4>
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
                       🗳️ QUESTION 14: TWO-PARTY SYSTEM EVALUATION CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>Which comes closest to your view of the two-party system?</strong>
                        </h4>
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
                       🗳️ QUESTION 15: GENERAL POLITICS OUTLOOK CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>When it comes to politics, which comes closest?</strong>
                        </h4>
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
                       🗳️ QUESTION 16: TRUMP FRUSTRATION EVALUATION CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>When you're frustrated with President Trump, is it mostly because he's gone too far, or not far enough?</strong>
                        </h4>
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
                       🗳️ QUESTION 17: INDEPENDENT PARTY LEAN CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>If you're not a member of the Democratic or Republican parties, do you lean toward either party, even a little?</strong>
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {leanOptions.map((option) => (
                                <div
                                    key={`lean-${option}`}
                                    onClick={() => !isSubmitting && setPartyLean(option)}
                                    className={`survey-box-option ${partyLean === option ? 'selected-box' : ''}`}
                                    style={{ fontSize: '13px', padding: '14px 4px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ==========================================
                       🗳️ QUESTION 18: 2026 CANDIDATE SUPPORT SIMULATION CARD
                       ========================================== */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>If your choices in 2026 came down to an independent-leaning Republican and a progressive Democrat, who would you likely support?</strong>
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                            {support2026Options.map((option) => (
                                <div
                                    key={`support-2026-${option}`}
                                    onClick={() => !isSubmitting && setCandidateSupport2026(option)}
                                    className={`survey-box-option ${candidateSupport2026 === option ? 'selected-box' : ''}`}
                                    style={{ fontSize: '13px', padding: '14px 4px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 📝 QUESTION 19: REASON FOR NON-MEMBERSHIP CARD */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>If you're not a member of the Democratic or Republican parties, why not?</strong>
                        </h4>
                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <textarea
                                className="survey-text-box"
                                placeholder="Type your response here..."
                                value={nonMemberReason}
                                onChange={(e) => setNonMemberReason(e.target.value)}
                                disabled={isSubmitting}
                                style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                    </div>

                    {/* 📝 QUESTION 20: ADDITIONAL COMMENTS CARD */}
                    <div className="survey-card" style={{ marginBottom: '28px' }}>
                        <h4 className="survey-question-prompt">
                            <strong>Is there anything else you would like to share?</strong>
                        </h4>
                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <textarea
                                className="survey-text-box"
                                placeholder="Type any additional comments here..."
                                value={additionalComments}
                                onChange={(e) => setAdditionalComments(e.target.value)}
                                disabled={isSubmitting}
                                style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="btn-survey-submit" 
                        /* 🚀 UNLOCKED: Submission stays active as long as the form isn't completely blank */
                        disabled={isSubmitting || !hasAnyResponse}
                    >
                        {isSubmitting ? 'Recording Ballots...' : 'Submit Response'}
                    </button>
                </form>
            </div>
        </div>
    );
}


