import { ConversationContext, DocumentType, Phase } from "./types";

export const SYSTEM_PROMPT = `You are the "Spec-Kit-Plus Writer", an expert AI agent specializing in the Panaversity methodology for turning ideas into fully specified projects.

## Your Core Behavior Rules:

1. **STRICT SEQUENTIAL WORKFLOW**: You MUST follow the exact phase order. Never skip phases or generate content for future phases.

2. **PHASE DEFINITIONS**:
   - IDEA_COLLECTION: Ask "What do you want to build today?" and understand the user's idea
   - CROSS_EXAMINATION: Ask EXACTLY 3 critical questions to clarify scope (one at a time)
   - CONSTITUTION: Generate high-level principles and rules for the project
   - SPECIFICATION: Generate detailed technical specifications
   - PLAN: Generate step-by-step implementation roadmap
   - TASKS: Generate actionable task breakdown
   - IMPLEMENTATION: Generate actual code/solution

3. **DOCUMENT GENERATION RULES**:
   - Each document must be comprehensive and well-structured
   - Use Markdown formatting with headers, lists, and code blocks
   - Build upon previously approved documents
   - Never proceed to the next phase until the current document is approved

4. **REVISION HANDLING**:
   - When asked to revise, carefully incorporate user feedback
   - Only regenerate the current document, not previous ones
   - Maintain consistency with approved documents

5. **OUTPUT FORMAT**:
   - For questions: Be concise and focused
   - For documents: Use proper Markdown structure with clear sections
   - Always be professional and thorough`;

export function buildContextPrompt(context: ConversationContext): string {
  let prompt = `## Current Context:\n\n`;

  if (context.idea) {
    prompt += `### Project Idea:\n${context.idea}\n\n`;
  }

  if (context.crossExaminationQA.length > 0) {
    prompt += `### Cross-Examination Q&A:\n`;
    context.crossExaminationQA.forEach((qa, i) => {
      prompt += `**Q${i + 1}**: ${qa.question}\n**A${i + 1}**: ${qa.answer}\n\n`;
    });
  }

  if (Object.keys(context.approvedDocuments).length > 0) {
    prompt += `### Approved Documents:\n`;
    for (const [type, content] of Object.entries(context.approvedDocuments)) {
      prompt += `#### ${type.toUpperCase()}:\n${content}\n\n---\n\n`;
    }
  }

  prompt += `### Current Phase: ${context.currentPhase}\n`;

  return prompt;
}

export function getPhasePrompt(
  phase: Phase,
  context: ConversationContext,
  userMessage?: string,
  isRevision?: boolean,
  feedback?: string
): string {
  const contextPrompt = buildContextPrompt(context);

  switch (phase) {
    case "idea_collection":
      return `${contextPrompt}

## Task:
The user has just started. Greet them warmly and ask: "What do you want to build today?"

Keep your response brief and welcoming.`;

    case "cross_examination":
      const questionNum = context.crossExaminationQA.length + 1;
      if (questionNum === 1) {
        return `${contextPrompt}

## Task:
The user wants to build: "${userMessage}"

Generate your FIRST critical cross-examination question to clarify the project scope.
Focus on understanding the core purpose and target users.

Respond with ONLY the question, nothing else.`;
      } else if (questionNum === 2) {
        return `${contextPrompt}

## Task:
Generate your SECOND critical cross-examination question.
Focus on technical requirements and constraints.

Respond with ONLY the question, nothing else.`;
      } else {
        return `${contextPrompt}

## Task:
Generate your THIRD and FINAL critical cross-examination question.
Focus on success criteria and key features.

Respond with ONLY the question, nothing else.`;
      }

    case "constitution":
      if (isRevision && feedback) {
        return `${contextPrompt}

## Task:
The user has requested revisions to the Constitution document.

User feedback: "${feedback}"

Please regenerate the CONSTITUTION document incorporating this feedback.
Maintain all valid content but address the user's concerns.

Use proper Markdown formatting with clear sections.`;
      }
      return `${contextPrompt}

## Task:
Generate the CONSTITUTION document for this project.

The Constitution should include:
1. **Project Vision**: Clear statement of what we're building and why
2. **Core Principles**: 5-7 guiding principles for development
3. **Constraints**: Technical, business, or resource limitations
4. **Success Criteria**: How we'll measure project success
5. **Non-Goals**: What this project explicitly won't do
6. **Stakeholders**: Who benefits from this project

Use proper Markdown formatting with headers and bullet points.`;

    case "specification":
      if (isRevision && feedback) {
        return `${contextPrompt}

## Task:
The user has requested revisions to the Specification document.

User feedback: "${feedback}"

Please regenerate the SPECIFICATION document incorporating this feedback.

Use proper Markdown formatting.`;
      }
      return `${contextPrompt}

## Task:
Generate the TECHNICAL SPECIFICATION document.

Building upon the approved Constitution, include:
1. **System Architecture**: High-level system design
2. **Technology Stack**: Detailed tech choices with justifications
3. **Data Models**: Core entities and relationships
4. **API Design**: Key endpoints/interfaces
5. **Security Requirements**: Authentication, authorization, data protection
6. **Performance Requirements**: Load expectations, response times
7. **Integration Points**: External services and APIs
8. **Error Handling Strategy**: How errors are managed

Use proper Markdown formatting with code blocks where appropriate.`;

    case "plan":
      if (isRevision && feedback) {
        return `${contextPrompt}

## Task:
The user has requested revisions to the Plan document.

User feedback: "${feedback}"

Please regenerate the PLAN document incorporating this feedback.

Use proper Markdown formatting.`;
      }
      return `${contextPrompt}

## Task:
Generate the PROJECT PLAN document.

Building upon approved documents, include:
1. **Phase Overview**: Major project phases with descriptions
2. **Timeline**: Estimated duration for each phase
3. **Milestones**: Key deliverables and checkpoints
4. **Dependencies**: What depends on what
5. **Risk Assessment**: Potential risks and mitigations
6. **Resource Requirements**: Team, tools, infrastructure needed
7. **Quality Assurance Strategy**: Testing and review processes

Use proper Markdown formatting with tables where appropriate.`;

    case "tasks":
      if (isRevision && feedback) {
        return `${contextPrompt}

## Task:
The user has requested revisions to the Tasks document.

User feedback: "${feedback}"

Please regenerate the TASKS document incorporating this feedback.

Use proper Markdown formatting.`;
      }
      return `${contextPrompt}

## Task:
Generate the TASK BREAKDOWN document.

Based on the approved Plan, create:
1. **Epic Breakdown**: Major work streams
2. **User Stories**: Detailed user stories with acceptance criteria
3. **Technical Tasks**: Specific development tasks
4. **Task Dependencies**: Task ordering and blockers
5. **Effort Estimates**: Story points or time estimates
6. **Priority Matrix**: High/Medium/Low prioritization
7. **Sprint Suggestions**: How tasks might be grouped into sprints

Use proper Markdown formatting with checkboxes and tables.`;

    case "implementation":
      if (isRevision && feedback) {
        return `${contextPrompt}

## Task:
The user has requested revisions to the Implementation document.

User feedback: "${feedback}"

Please regenerate the IMPLEMENTATION document incorporating this feedback.

Use proper Markdown formatting with code blocks.`;
      }
      return `${contextPrompt}

## Task:
Generate the IMPLEMENTATION GUIDE document.

This is the final deliverable. Include:
1. **Setup Instructions**: Environment setup and prerequisites
2. **Project Structure**: Directory layout and file organization
3. **Core Implementation**: Key code implementations with explanations
4. **Configuration Files**: Essential config file contents
5. **Database Schema**: SQL or schema definitions
6. **API Implementation**: Key endpoint implementations
7. **Testing Setup**: Test configuration and example tests
8. **Deployment Guide**: How to deploy the application
9. **Documentation**: README and inline documentation standards

Provide actual code snippets and configuration examples.
Use proper Markdown formatting with extensive code blocks.`;

    default:
      return contextPrompt;
  }
}

export function getDocumentTypeFromPhase(phase: Phase): DocumentType | null {
  const mapping: Partial<Record<Phase, DocumentType>> = {
    constitution: "constitution",
    specification: "specification",
    plan: "plan",
    tasks: "tasks",
    implementation: "implementation",
  };
  return mapping[phase] || null;
}