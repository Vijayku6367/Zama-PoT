class PrivateProofOfTalent {
    constructor() {
        this.wallet = null;
        this.fhe = new FHECompute();
        this.contract = new ContractInteract();
        this.currentQuiz = null;
        this.userAnswers = [];
        
        this.initializeApp();
    }

    async initializeApp() {
        // Load sample quiz
        this.loadQuiz();
        
        // Setup event listeners
        document.getElementById('connect-wallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('submit-quiz').addEventListener('click', () => this.submitQuiz());
        document.getElementById('mint-badge').addEventListener('click', () => this.mintBadge());
    }

    async connectWallet() {
        try {
            // Simulate wallet connection - in real app, use Zama wallet
            this.wallet = {
                address: '0x' + Math.random().toString(16).substr(2, 40)
            };
            
            document.getElementById('wallet-address').textContent = 
                this.wallet.address.substr(0, 6) + '...' + this.wallet.address.substr(-4);
            document.getElementById('wallet-info').classList.remove('hidden');
            document.getElementById('connect-wallet').textContent = 'Connected ✅';
            
            console.log('Wallet connected:', this.wallet.address);
        } catch (error) {
            console.error('Wallet connection failed:', error);
        }
    }

    loadQuiz() {
        // Sample coding quiz
        this.currentQuiz = {
            id: 1,
            title: "Basic JavaScript Quiz",
            questions: [
                {
                    id: 1,
                    question: "What does 'const' mean in JavaScript?",
                    options: [
                        "Constant - cannot be reassigned",
                        "Variable - can be changed",
                        "Function declaration",
                        "Class definition"
                    ],
                    correct: 0
                },
                {
                    id: 2,
                    question: "Which method adds an element to an array?",
                    options: [
                        "array.add()",
                        "array.push()", 
                        "array.insert()",
                        "array.append()"
                    ],
                    correct: 1
                },
                {
                    id: 3,
                    question: "What is the output of: console.log(typeof null)?",
                    options: [
                        "null",
                        "undefined", 
                        "object",
                        "string"
                    ],
                    correct: 2
                }
            ]
        };

        this.renderQuiz();
    }

    renderQuiz() {
        const questionsContainer = document.getElementById('questions');
        questionsContainer.innerHTML = '';

        this.currentQuiz.questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            questionDiv.innerHTML = `
                <h4>Q${index + 1}: ${q.question}</h4>
                ${q.options.map((option, optIndex) => `
                    <div class="option" data-q="${index}" data-a="${optIndex}">
                        ${option}
                    </div>
                `).join('')}
            `;
            questionsContainer.appendChild(questionDiv);
        });

        // Add option selection
        document.querySelectorAll('.option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                const questionIndex = parseInt(e.target.dataset.q);
                const answerIndex = parseInt(e.target.dataset.a);
                
                // Remove selection from other options in same question
                e.target.parentElement.querySelectorAll('.option').forEach(o => {
                    o.classList.remove('selected');
                });
                
                e.target.classList.add('selected');
                this.userAnswers[questionIndex] = answerIndex;
            });
        });
    }

    async submitQuiz() {
        if (!this.wallet) {
            alert('Please connect wallet first!');
            return;
        }

        if (this.userAnswers.length !== this.currentQuiz.questions.length) {
            alert('Please answer all questions!');
            return;
        }

        try {
            // Show loading
            document.getElementById('submit-quiz').textContent = 'Encrypting...';
            document.getElementById('submit-quiz').disabled = true;

            // Initialize FHE
            await this.fhe.initialize();
            
            // Encrypt answers
            const encryptedAnswers = this.fhe.encryptAnswers(this.userAnswers);
            
            // Simulate FHE evaluation (in real app, this would be on-chain)
            const result = await this.fhe.evaluateAnswers(
                encryptedAnswers, 
                this.currentQuiz.questions.map(q => q.correct)
            );

            this.showResults(result);
            
        } catch (error) {
            console.error('Quiz submission failed:', error);
            alert('Submission failed: ' + error.message);
        } finally {
            document.getElementById('submit-quiz').textContent = 'Submit Encrypted Answers';
            document.getElementById('submit-quiz').disabled = false;
        }
    }

    showResults(result) {
        const resultsSection = document.getElementById('results-section');
        const resultStatus = document.getElementById('result-status');
        
        resultsSection.classList.remove('hidden');
        
        if (result.passed) {
            resultStatus.innerHTML = `
                <div style="color: #10b981; text-align: center;">
                    <h3>✅ Passed!</h3>
                    <p>Level: ${result.level.toUpperCase()}</p>
                </div>
            `;
            document.getElementById('mint-badge').classList.remove('hidden');
            
            // Show badge preview
            const badgePreview = document.getElementById('badge-preview');
            badgePreview.classList.remove('hidden');
            badgePreview.innerHTML = `
                <div class="badge">${result.level} Developer</div>
            `;
        } else {
            resultStatus.innerHTML = `
                <div style="color: #ef4444; text-align: center;">
                    <h3>❌ Try Again</h3>
                    <p>Keep practicing! You can retake the quiz.</p>
                </div>
            `;
        }
    }

    async mintBadge() {
        try {
            document.getElementById('mint-badge').textContent = 'Minting...';
            document.getElementById('mint-badge').disabled = true;

            // In real app, this would call actual contract
            const tx = await this.contract.mintTalentBadge(
                this.wallet.address,
                'developer',
                'encrypted_score_data'
            );

            alert('🎉 Badge minted successfully!');
            this.loadUserBadges();
            
        } catch (error) {
            console.error('Minting failed:', error);
            alert('Minting failed: ' + error.message);
        } finally {
            document.getElementById('mint-badge').textContent = 'Mint Talent Badge';
            document.getElementById('mint-badge').disabled = false;
        }
    }

    loadUserBadges() {
        // Simulate loading user badges
        const badgesList = document.getElementById('badges-list');
        badgesList.innerHTML = `
            <div class="badge">JavaScript Developer</div>
            <div class="badge">Web3 Enthusiast</div>
        `;
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PrivateProofOfTalent();
});
