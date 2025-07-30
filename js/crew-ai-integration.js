/**
 * CrewAI Integration for Darcy AI
 * Multi-Agent Educational System Implementation
 */

class DarcyCrewAISystem {
    constructor() {
        this.crews = new Map();
        this.flows = new Map();
        this.activeAgents = new Map();
        this.taskQueue = [];
        this.executionHistory = [];
        
        this.initializeEducationalCrews();
    }

    /**
     * Initialize specialized educational crews
     */
    initializeEducationalCrews() {
        // 1. Teaching Crew - Para instrução e tutoria
        this.crews.set('teaching', {
            name: 'Educational Teaching Crew',
            agents: [
                {
                    id: 'primary_tutor',
                    role: 'Primary Educational Tutor',
                    goal: 'Provide personalized, adaptive instruction across multiple subjects',
                    backstory: 'Expert tutor with 20+ years experience in personalized education',
                    specializations: ['mathematics', 'science', 'languages', 'programming'],
                    personality: 'patient, encouraging, adaptive'
                },
                {
                    id: 'concept_explainer',
                    role: 'Concept Breakdown Specialist',
                    goal: 'Break down complex concepts into digestible parts',
                    backstory: 'Master at simplifying complex ideas for different learning levels',
                    specializations: ['conceptual_analysis', 'analogies', 'visual_explanations'],
                    personality: 'clear, methodical, creative'
                },
                {
                    id: 'practice_generator',
                    role: 'Practice Exercise Creator',
                    goal: 'Generate appropriate practice exercises and assessments',
                    backstory: 'Educational assessment expert specializing in adaptive learning',
                    specializations: ['exercise_creation', 'difficulty_adaptation', 'progress_tracking'],
                    personality: 'structured, goal-oriented, supportive'
                }
            ],
            process: 'collaborative', // Agents work together simultaneously
            memory: true,
            verbose: true
        });

        // 2. Research Crew - Para pesquisa e análise de documentos
        this.crews.set('research', {
            name: 'Academic Research Crew',
            agents: [
                {
                    id: 'document_analyst',
                    role: 'Document Analysis Specialist',
                    goal: 'Analyze uploaded documents and extract key educational content',
                    backstory: 'Expert in academic document analysis and knowledge extraction',
                    specializations: ['pdf_analysis', 'content_extraction', 'summarization'],
                    personality: 'thorough, analytical, precise'
                },
                {
                    id: 'research_synthesizer',
                    role: 'Research Synthesis Expert',
                    goal: 'Synthesize information from multiple sources into coherent explanations',
                    backstory: 'Academic researcher skilled in connecting diverse information sources',
                    specializations: ['information_synthesis', 'cross_referencing', 'fact_checking'],
                    personality: 'comprehensive, logical, insightful'
                },
                {
                    id: 'source_validator',
                    role: 'Source Validation Specialist',
                    goal: 'Validate information accuracy and provide credible sources',
                    backstory: 'Information scientist specializing in source credibility assessment',
                    specializations: ['fact_checking', 'source_verification', 'bias_detection'],
                    personality: 'skeptical, thorough, objective'
                }
            ],
            process: 'sequential', // One agent passes results to the next
            memory: true,
            tools: ['web_search', 'document_parser', 'fact_checker']
        });

        // 3. Creative Crew - Para projetos criativos e práticos
        this.crews.set('creative', {
            name: 'Creative Project Crew',
            agents: [
                {
                    id: 'project_designer',
                    role: 'Educational Project Designer',
                    goal: 'Design engaging, hands-on learning projects',
                    backstory: 'Creative educator specializing in project-based learning',
                    specializations: ['project_design', 'hands_on_learning', 'creativity'],
                    personality: 'innovative, inspiring, practical'
                },
                {
                    id: 'code_mentor',
                    role: 'Programming Mentor',
                    goal: 'Guide students through coding projects and debugging',
                    backstory: 'Senior developer with extensive teaching experience',
                    specializations: ['programming', 'debugging', 'code_review', 'best_practices'],
                    personality: 'patient, detail-oriented, encouraging'
                },
                {
                    id: 'presentation_coach',
                    role: 'Presentation and Communication Coach',
                    goal: 'Help students present and communicate their work effectively',
                    backstory: 'Communication expert with experience in educational settings',
                    specializations: ['presentation_skills', 'communication', 'feedback'],
                    personality: 'supportive, constructive, confident'
                }
            ],
            process: 'collaborative',
            memory: true,
            tools: ['code_executor', 'presentation_builder']
        });

        // 4. Assessment Crew - Para avaliação e feedback
        this.crews.set('assessment', {
            name: 'Learning Assessment Crew',
            agents: [
                {
                    id: 'progress_tracker',
                    role: 'Learning Progress Analyst',
                    goal: 'Track and analyze student learning progress',
                    backstory: 'Educational data analyst specializing in learning analytics',
                    specializations: ['progress_tracking', 'data_analysis', 'learning_patterns'],
                    personality: 'observant, data-driven, encouraging'
                },
                {
                    id: 'feedback_specialist',
                    role: 'Constructive Feedback Specialist',
                    goal: 'Provide detailed, actionable feedback on student work',
                    backstory: 'Master teacher known for transformative feedback',
                    specializations: ['feedback_delivery', 'improvement_strategies', 'motivation'],
                    personality: 'constructive, specific, motivating'
                },
                {
                    id: 'adaptation_strategist',
                    role: 'Learning Adaptation Strategist',
                    goal: 'Adapt teaching strategies based on student performance',
                    backstory: 'Educational psychologist specializing in adaptive learning',
                    specializations: ['adaptive_learning', 'learning_styles', 'strategy_adjustment'],
                    personality: 'flexible, insightful, strategic'
                }
            ],
            process: 'sequential',
            memory: true,
            tools: ['analytics_engine', 'progress_visualizer']
        });
    }

    /**
     * Create educational flows for complex learning scenarios
     */
    initializeEducationalFlows() {
        // 1. Complete Learning Session Flow
        this.flows.set('learning_session', {
            name: 'Complete Learning Session Flow',
            steps: [
                {
                    id: 'assess_prior_knowledge',
                    type: 'crew_task',
                    crew: 'assessment',
                    task: 'Assess student\'s current knowledge level',
                    next: ['personalize_content']
                },
                {
                    id: 'personalize_content',
                    type: 'crew_task',
                    crew: 'teaching',
                    task: 'Create personalized learning content',
                    next: ['deliver_instruction']
                },
                {
                    id: 'deliver_instruction',
                    type: 'crew_task',
                    crew: 'teaching',
                    task: 'Deliver interactive instruction',
                    next: ['check_understanding']
                },
                {
                    id: 'check_understanding',
                    type: 'assessment',
                    task: 'Evaluate student understanding',
                    next: ['provide_practice', 'reteach_concepts']
                },
                {
                    id: 'provide_practice',
                    type: 'crew_task',
                    crew: 'teaching',
                    task: 'Generate and supervise practice exercises',
                    condition: 'understanding_good',
                    next: ['final_assessment']
                },
                {
                    id: 'reteach_concepts',
                    type: 'crew_task',
                    crew: 'teaching',
                    task: 'Reteach concepts using different approach',
                    condition: 'understanding_poor',
                    next: ['check_understanding']
                },
                {
                    id: 'final_assessment',
                    type: 'crew_task',
                    crew: 'assessment',
                    task: 'Provide comprehensive feedback and next steps',
                    next: []
                }
            ]
        });

        // 2. Document Analysis Flow
        this.flows.set('document_analysis', {
            name: 'Multi-Document Analysis Flow',
            steps: [
                {
                    id: 'process_documents',
                    type: 'crew_task',
                    crew: 'research',
                    task: 'Process and analyze uploaded documents',
                    next: ['extract_concepts']
                },
                {
                    id: 'extract_concepts',
                    type: 'crew_task',
                    crew: 'research',
                    task: 'Extract key concepts and relationships',
                    next: ['create_explanations']
                },
                {
                    id: 'create_explanations',
                    type: 'crew_task',
                    crew: 'teaching',
                    task: 'Create clear explanations of extracted concepts',
                    next: ['generate_questions']
                },
                {
                    id: 'generate_questions',
                    type: 'crew_task',
                    crew: 'teaching',
                    task: 'Generate study questions and exercises',
                    next: []
                }
            ]
        });

        // 3. Project-Based Learning Flow
        this.flows.set('project_learning', {
            name: 'Project-Based Learning Flow',
            steps: [
                {
                    id: 'design_project',
                    type: 'crew_task',
                    crew: 'creative',
                    task: 'Design appropriate learning project',
                    next: ['guide_implementation']
                },
                {
                    id: 'guide_implementation',
                    type: 'crew_task',
                    crew: 'creative',
                    task: 'Guide student through project implementation',
                    next: ['review_progress']
                },
                {
                    id: 'review_progress',
                    type: 'crew_task',
                    crew: 'assessment',
                    task: 'Review and provide feedback on progress',
                    next: ['continue_guidance', 'finalize_project']
                },
                {
                    id: 'continue_guidance',
                    type: 'crew_task',
                    crew: 'creative',
                    task: 'Continue guidance and support',
                    condition: 'project_incomplete',
                    next: ['review_progress']
                },
                {
                    id: 'finalize_project',
                    type: 'crew_task',
                    crew: 'creative',
                    task: 'Help finalize and present project',
                    condition: 'project_complete',
                    next: []
                }
            ]
        });
    }

    /**
     * Execute a crew for a specific educational task
     */
    async executeCrew(crewName, task, context = {}) {
        const crew = this.crews.get(crewName);
        if (!crew) {
            throw new Error(`Crew '${crewName}' not found`);
        }

        console.log(`🤖 Executing ${crew.name} for task: ${task}`);

        const execution = {
            id: this.generateExecutionId(),
            crewName,
            task,
            context,
            startTime: Date.now(),
            agents: crew.agents,
            process: crew.process,
            status: 'running'
        };

        this.executionHistory.push(execution);

        try {
            let result;

            if (crew.process === 'sequential') {
                result = await this.executeSequentialProcess(crew, task, context);
            } else if (crew.process === 'collaborative') {
                result = await this.executeCollaborativeProcess(crew, task, context);
            } else if (crew.process === 'hierarchical') {
                result = await this.executeHierarchicalProcess(crew, task, context);
            }

            execution.status = 'completed';
            execution.endTime = Date.now();
            execution.result = result;

            return result;

        } catch (error) {
            execution.status = 'failed';
            execution.error = error.message;
            execution.endTime = Date.now();
            throw error;
        }
    }

    /**
     * Execute sequential process (one agent after another)
     */
    async executeSequentialProcess(crew, task, context) {
        const results = [];
        let currentContext = { ...context };

        for (const agent of crew.agents) {
            console.log(`🔄 Agent ${agent.role} starting task...`);
            
            const agentResult = await this.executeAgentTask(agent, task, currentContext);
            results.push({
                agent: agent.id,
                role: agent.role,
                result: agentResult
            });

            // Pass result to next agent
            currentContext.previousResults = results;
            currentContext.lastResult = agentResult;
        }

        return this.synthesizeResults(results, 'sequential');
    }

    /**
     * Execute collaborative process (agents work together)
     */
    async executeCollaborativeProcess(crew, task, context) {
        console.log(`🤝 Starting collaborative process with ${crew.agents.length} agents`);

        // All agents work on the task simultaneously but with different focuses
        const agentPromises = crew.agents.map(agent => 
            this.executeAgentTask(agent, task, context)
        );

        const results = await Promise.all(agentPromises);
        
        const formattedResults = results.map((result, index) => ({
            agent: crew.agents[index].id,
            role: crew.agents[index].role,
            result: result
        }));

        return this.synthesizeResults(formattedResults, 'collaborative');
    }

    /**
     * Execute hierarchical process (manager delegates to workers)
     */
    async executeHierarchicalProcess(crew, task, context) {
        // Find manager agent (first agent is typically the manager)
        const manager = crew.agents[0];
        const workers = crew.agents.slice(1);

        console.log(`👑 Manager ${manager.role} delegating task to ${workers.length} workers`);

        // Manager analyzes task and creates delegation plan
        const delegationPlan = await this.createDelegationPlan(manager, task, workers, context);

        // Execute delegated tasks
        const workerResults = [];
        for (const delegation of delegationPlan.delegations) {
            const worker = workers.find(w => w.id === delegation.agentId);
            const result = await this.executeAgentTask(worker, delegation.task, delegation.context);
            workerResults.push({
                agent: worker.id,
                role: worker.role,
                result: result
            });
        }

        // Manager synthesizes worker results
        const finalResult = await this.managerSynthesis(manager, task, workerResults, context);

        return {
            manager: manager.role,
            delegations: workerResults,
            synthesis: finalResult
        };
    }

    /**
     * Execute individual agent task
     */
    async executeAgentTask(agent, task, context) {
        // Simulate agent thinking and task execution
        const agentPrompt = this.createAgentPrompt(agent, task, context);
        
        // In real implementation, this would call the LLM with agent-specific prompt
        const result = await this.callLLMForAgent(agent, agentPrompt);
        
        // Update agent memory if enabled
        if (context.memory) {
            this.updateAgentMemory(agent.id, task, result);
        }

        return result;
    }

    /**
     * Create agent-specific prompt
     */
    createAgentPrompt(agent, task, context) {
        let prompt = `You are ${agent.role}.\n\n`;
        prompt += `Background: ${agent.backstory}\n\n`;
        prompt += `Your goal: ${agent.goal}\n\n`;
        prompt += `Specializations: ${agent.specializations.join(', ')}\n\n`;
        prompt += `Personality: ${agent.personality}\n\n`;
        prompt += `Task: ${task}\n\n`;
        
        if (context.previousResults) {
            prompt += `Previous agent results to consider:\n`;
            context.previousResults.forEach(result => {
                prompt += `- ${result.role}: ${result.result}\n`;
            });
            prompt += '\n';
        }
        
        if (context.studentLevel) {
            prompt += `Student level: ${context.studentLevel}\n`;
        }
        
        if (context.subject) {
            prompt += `Subject area: ${context.subject}\n`;
        }
        
        prompt += `Please complete this task according to your role and expertise.`;
        
        return prompt;
    }

    /**
     * Call LLM for specific agent (integrated with existing LLM system)
     */
    async callLLMForAgent(agent, prompt) {
        // This would integrate with the existing LLMProviders system
        if (window.LLMProviders) {
            const response = await window.LLMProviders.sendMessage(prompt);
            return response;
        }
        
        // Fallback simulation
        return `Agent ${agent.role} completed the task with specialized approach focusing on ${agent.specializations[0]}.`;
    }

    /**
     * Synthesize results from multiple agents
     */
    synthesizeResults(results, processType) {
        if (processType === 'sequential') {
            return {
                type: 'sequential',
                finalResult: results[results.length - 1].result,
                steps: results,
                summary: 'Task completed through sequential agent collaboration'
            };
        } else if (processType === 'collaborative') {
            return {
                type: 'collaborative',
                perspectives: results,
                synthesis: this.combineCollaborativeResults(results),
                summary: 'Task completed through collaborative agent teamwork'
            };
        }
    }

    /**
     * Combine collaborative results
     */
    combineCollaborativeResults(results) {
        // Combine different agent perspectives into comprehensive result
        let combined = 'Collaborative Result:\n\n';
        
        results.forEach(result => {
            combined += `**${result.role}:**\n${result.result}\n\n`;
        });
        
        return combined;
    }

    /**
     * Execute educational flow
     */
    async executeFlow(flowName, initialContext = {}) {
        const flow = this.flows.get(flowName);
        if (!flow) {
            throw new Error(`Flow '${flowName}' not found`);
        }

        console.log(`🔄 Starting flow: ${flow.name}`);

        const execution = {
            flowName,
            steps: [],
            context: initialContext,
            status: 'running',
            startTime: Date.now()
        };

        let currentStep = flow.steps[0];
        let context = { ...initialContext };

        while (currentStep) {
            console.log(`📍 Executing step: ${currentStep.id}`);

            const stepResult = await this.executeFlowStep(currentStep, context);
            
            execution.steps.push({
                stepId: currentStep.id,
                result: stepResult,
                timestamp: Date.now()
            });

            // Update context with step result
            context.stepResults = context.stepResults || {};
            context.stepResults[currentStep.id] = stepResult;

            // Determine next step
            currentStep = this.getNextStep(flow, currentStep, stepResult, context);
        }

        execution.status = 'completed';
        execution.endTime = Date.now();

        return execution;
    }

    /**
     * Execute individual flow step
     */
    async executeFlowStep(step, context) {
        if (step.type === 'crew_task') {
            return await this.executeCrew(step.crew, step.task, context);
        } else if (step.type === 'assessment') {
            return await this.executeAssessment(step.task, context);
        } else if (step.type === 'decision') {
            return await this.executeDecision(step.task, context);
        }
    }

    /**
     * Get next step in flow based on conditions
     */
    getNextStep(flow, currentStep, stepResult, context) {
        if (!currentStep.next || currentStep.next.length === 0) {
            return null; // End of flow
        }

        // Simple next step (no conditions)
        if (currentStep.next.length === 1 && !currentStep.condition) {
            return flow.steps.find(step => step.id === currentStep.next[0]);
        }

        // Conditional next step
        const nextStepId = this.evaluateCondition(currentStep, stepResult, context);
        return flow.steps.find(step => step.id === nextStepId);
    }

    /**
     * Evaluate conditions for flow control
     */
    evaluateCondition(step, result, context) {
        // Simple condition evaluation
        if (step.condition === 'understanding_good' && context.understandingLevel === 'good') {
            return step.next[0];
        } else if (step.condition === 'understanding_poor' && context.understandingLevel === 'poor') {
            return step.next[1];
        }
        
        return step.next[0]; // Default
    }

    /**
     * Integration with existing Darcy Avatar System
     */
    integrateWithAvatar() {
        if (window.AvatarSystem) {
            // Extend avatar to show crew activity
            const originalSetState = window.AvatarSystem.setState;
            
            window.AvatarSystem.setState = function(state, reason) {
                if (state === 'thinking' && reason?.includes('crew')) {
                    // Special avatar behavior for crew thinking
                    this.element.setAttribute('data-crew-active', 'true');
                    this.speechBubble.innerHTML = `🤖 ${reason}`;
                }
                return originalSetState.call(this, state, reason);
            };

            // Add crew visualization to avatar
            window.AvatarSystem.showCrewActivity = function(crewName, agentCount) {
                this.speechBubble.innerHTML = `
                    <div class="crew-activity">
                        <span class="crew-name">${crewName}</span>
                        <div class="agent-indicators">
                            ${Array(agentCount).fill('🤖').join('')}
                        </div>
                    </div>
                `;
            };
        }
    }

    /**
     * Integration with existing multimodal system
     */
    integrateWithMultimodal() {
        if (window.MultimodalSystem) {
            // Extend file processing to use research crew
            const originalProcessFile = window.MultimodalSystem.processAdvancedFile;
            
            window.MultimodalSystem.processAdvancedFile = async function(file) {
                if (file.type === 'application/pdf' || 
                    file.type.includes('document') ||
                    file.type.includes('spreadsheet')) {
                    
                    // Use research crew for document analysis
                    const crewSystem = window.darcyCrewAI;
                    if (crewSystem) {
                        const result = await crewSystem.executeFlow('document_analysis', {
                            file: file,
                            studentLevel: 'intermediate'
                        });
                        return result;
                    }
                }
                
                return originalProcessFile.call(this, file);
            };
        }
    }

    /**
     * Utility methods
     */
    generateExecutionId() {
        return 'exec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updateAgentMemory(agentId, task, result) {
        // Store agent memory for future reference
        if (!this.agentMemory) {
            this.agentMemory = new Map();
        }
        
        if (!this.agentMemory.has(agentId)) {
            this.agentMemory.set(agentId, []);
        }
        
        this.agentMemory.get(agentId).push({
            task,
            result,
            timestamp: Date.now()
        });
    }

    getExecutionHistory() {
        return this.executionHistory;
    }

    getAvailableCrews() {
        return Array.from(this.crews.keys());
    }

    getAvailableFlows() {
        return Array.from(this.flows.keys());
    }
}

// Initialize CrewAI system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.darcyCrewAI = new DarcyCrewAISystem();
    
    // Integrate with existing systems
    window.darcyCrewAI.integrateWithAvatar();
    window.darcyCrewAI.integrateWithMultimodal();
    
    console.log('🤖 Darcy CrewAI System initialized with', 
               window.darcyCrewAI.getAvailableCrews().length, 'crews and',
               window.darcyCrewAI.getAvailableFlows().length, 'flows');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarcyCrewAISystem;
}
