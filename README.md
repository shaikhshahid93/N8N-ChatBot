# RAG Knowledge Base Chatbot

An AI-powered admissions chatbot built using n8n and Retrieval-Augmented Generation (RAG).

The chatbot answers organization-specific questions using information stored in a knowledge base rather than relying on general AI knowledge.

## Overview

I built this project to create an admissions assistant that can answer questions about topics such as:

- Admissions
- Fees
- Eligibility
- Applications
- Refunds
- Courses and programs
- Requirements
- Policies
- Deadlines
- Contact information

The system uses a RAG pipeline to retrieve relevant information from the knowledge base before generating a response.

## How It Works

### 1. Knowledge Base

The workflow periodically checks files stored in Google Drive and compares them with records maintained in Supabase.

It detects:

- New files
- Modified files
- Unchanged files
- Deleted files

New or modified documents are processed and added to the vector database. :chatgpt-content-reference{index="0"}

The document-processing pipeline extracts the content, splits it into smaller chunks, generates embeddings using Hugging Face's `thenlper/gte-large`, and stores the resulting vectors in Supabase Vector Store. :chatgpt-content-reference{index="1"} :chatgpt-content-reference{index="2"}

### 2. Chatbot

Users can interact with the Admissions Assistant through the web chat interface.

When a question is asked:

1. The AI agent receives the question.
2. It searches the knowledge base for relevant information.
3. The retrieved information is provided to the model.
4. The assistant generates an answer based on the retrieved content.

The chatbot uses Gemini as the language model, Supabase Vector Store for retrieval, and conversation memory for follow-up questions. :chatgpt-content-reference{index="3"} :chatgpt-content-reference{index="4"}

## Features

- RAG-based question answering
- Google Drive knowledge-base ingestion
- Automatic detection of new and modified documents
- Document embeddings and vector search
- Supabase Vector Store
- Gemini-powered responses
- Conversation memory
- Web-based chat interface
- Knowledge-base-only responses to reduce unsupported answers

## Tech Stack

- n8n
- Retrieval-Augmented Generation (RAG)
- Google Drive
- Supabase
- Supabase Vector Store
- Hugging Face
- Gemini
- HTML
- CSS
- JavaScript

## Project Structure

```text
N8N-ChatBot/
│
├── RAG Knowledge Base Chatbot.json
├── index.html
├── script.js
├── style.css
└── rag-knowledge-base-chatbot.png
