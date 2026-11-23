https://github.com/kjpou1/regimetry.git

regimetry
Mapping latent regimes in financial time series.

MIT License Python 3.11+ Built with TensorFlow Visualize with Dash Managed with Poetry Development Status Made With ❤️

regimetry
📘 Overview
🔍 What is a Regime?
🧠 How It Works
1. Data Ingestion
2. Embedding Pipeline
3. Clustering
4. Visualization & Interpretation
🚀 Getting Started
📘 Regime Detection Window Delay
📚 Documentation
📟 Command Line Usage
🔹 Ingest Data
🔹 Generate Embeddings
🛠 Available CLI Arguments for embed
🔹 Cluster Regimes
🛠 Available CLI Arguments for cluster
🔹 Analyze Regime Structure
🔹 Analyze Full Pipeline (Embed + Cluster)
🛠 Available CLI Arguments for analyze
🧪 Example Dataset
🛠️ Configuration Files
📂 Example Config
✅ Section: Configuration Files → Example Config
🧠 Usage in CLI
🖼️ Usage in Dash App
🖥️ Interactive Dashboard
🚀 Launch the App
🧩 Features
📂 Directory Structure
📦 Example Config for Palette Preview
🛠 Project Structure
🧭 Orientation Going Forward
✅ Status
🔗 Related Projects
📖 Further Reading
📄 License
👤 Author
📘 Overview
regimetry is a modular, unsupervised regime detection engine for financial time series — originally developed as a personal research project to explore latent structure and behavioral transitions in markets.

It combines transformer-based embeddings with clustering and regime structure analysis to help identify and label recurring phases such as trends, reversals, and volatility shifts.

While built for exploratory analysis, regimetry may evolve into a foundational component of my broader trading strategy stack.

⚙️ Tech Highlights:

Transformer encoder with positional encoding
Attention-based temporal modeling (windowed)
Spectral clustering on learned embeddings
Regime structure modeling via Markov transitions, stickiness, and entropy
🔍 What is a Regime?
In regimetry, a regime is a latent, temporally structured pattern in market behavior — characterized by combinations of volatility, trend strength, momentum shifts, and signal alignment. These are not defined by hand, but emerge from patterns discovered in the data.

Formally:

Regimes are clusters in the embedding space of overlapping market windows (e.g., 30 bars).
Each embedding is generated via a Transformer encoder that learns internal structure within each window using attention over time.
Spectral clustering then groups these embeddings into recurring behavioral states the market tends to revisit.
🧠 How It Works
1. Data Ingestion
Load daily bar data per instrument
Normalize features (Close, AHMA, LP, LC, etc.)
Features are typically sourced from ConvolutionLab,
but regimetry is not dependent on that specific pipeline — any compatible feature set can be used.
Slice into overlapping windows (default: 30 bars, stride 1)
2. Embedding Pipeline
Each rolling window is passed through a Transformer encoder that uses positional encoding to preserve temporal structure and self-attention to learn nonlinear dependencies within the window.
This produces a dense, contextualized embedding that reflects local market dynamics.
The architecture is modular and can be swapped with alternatives such as autoencoders, SimCLR, or CNN-based encoders.
3. Clustering
Standardize the embeddings
Cluster them using Spectral Clustering (or another method)
Assign each window a regime_id
4. Visualization & Interpretation
Use t-SNE or UMAP to project embeddings
Visualize regime transitions over time
Map regimes back to chart or signal data for strategy insights
🚀 Getting Started
See the full step-by-step guide: 📖 docs/GETTING_STARTED_README.md

Includes:

Git clone instructions
Poetry or manual install
Data ingestion
Embedding generation
Regime clustering
Optional Dash dashboard launch
📘 Regime Detection Window Delay
📄 See: docs/REGIME_DETECTION_README.md

Because regime labels are assigned based on rolling windows, the cluster ID for the final bars of a dataset cannot be known until the full window is complete.

For example, with a window_size = 30:

The first 29 bars will not receive a regime ID
The last 29 bars also do not reflect any future regime change, since there are no forward windows to reclassify them
This introduces a natural lag in regime detection:

New regimes will only appear after enough time has passed for the model to “observe” a full window in the new market condition.
👉 For more details, see the full explanation: REGIME_DETECTION_README.md

📚 Documentation
📘 Getting Started Step-by-step setup, from ingestion to visualization.
🧠 Regime Detection Window Logic Explains the natural lag from using rolling windows in clustering.
🧭 Regime Assignment & Label Alignment Details how Spectral Clustering labels are aligned across runs using the Hungarian algorithm, with persistent baseline mapping and cluster color stability.
📟 Command Line Usage
Run regimetry pipelines directly from the command line with optional overrides.

🔹 Ingest Data
python launch_host.py ingest \
  --signal-input-path examples/EUR_USD_processed_signals.csv
This will:

Parse the input CSV
Normalize and structure features
Save the result to artifacts/data/processed/
🔹 Generate Embeddings
python launch_host.py embed \
  --signal-input-path examples/EUR_USD_processed_signals.csv \
  --output-name EUR_USD_embeddings.npy \
  --window-size 30 \
  --stride 1 \
  --encoding-method sinusoidal \
  --encoding-style interleaved
This will:

Apply a rolling window (default: 30 bars, stride: 1 unless overridden)
Use positional encoding and Transformer to generate embeddings
Save the result to embeddings/EUR_USD_embeddings.npy
⚠️ Note: Ensure that window_size is smaller than your dataset length. If window_size >= len(data), no embeddings will be produced.

Ah — got it. Since --embedding-dim is now used for both learnable and sinusoidal, the description needs to be updated accordingly. Here's the revised table and footnote:

🛠 Available CLI Arguments for embed
Argument	Description
--signal-input-path	Path to the CSV file with feature-enriched signal data
--output-name	Optional output file name for the .npy embeddings (default: embeddings.npy)
--window-size	Number of time steps per rolling window (default: 30)
--stride	Step size between rolling windows (default: 1)
--encoding-method	Positional encoding method: sinusoidal (default) or learnable
--encoding-style	Sinusoidal encoding format: interleaved (default) or stacked
--embedding-dim	Embedding dimension to use for both sinusoidal and learnable encodings
--config	Optional YAML config path to override pipeline settings
--debug	Enable debug logging
ℹ️ Note: --embedding-dim applies to both sinusoidal and learnable encodings. For sinusoidal, it sets the generated frequency embedding size. For learnable, it defines the trainable positional embedding dimension.

🔹 Cluster Regimes
python launch_host.py cluster \
  --embedding-path embeddings/EUR_USD_embeddings.npy \
  --regime-data-path data/processed/regime_input.csv \
  --output-dir reports/EUR_USD \
  --window-size 30 \
  --n-clusters 3
This will:

Load precomputed transformer embeddings
Apply spectral clustering to assign regime IDs
Align cluster labels with original time-series data (using window_size for offset)
Generate visualizations (t-SNE, UMAP, timeline, and price overlay)
Save outputs to the specified report directory
⚠️ Note: The window_size used here must match the one used during embedding. Otherwise, the cluster labels will not align correctly with the input time series.

🛠 Available CLI Arguments for cluster
Argument	Description
--embedding-path	Path to the .npy file with saved embeddings
--regime-data-path	CSV file containing the signal-enriched time series (e.g., regime_input.csv)
--output-dir	Directory to save visualizations and labeled data
--window-size	Window size used during embedding (used for alignment)
--n-clusters	Number of regimes (clusters) to detect (default: 3)
--config	Optional YAML config file to provide all arguments at once
--debug	Enable debug logging
🔹 Analyze Regime Structure
python launch_host.py interpret \
  --input-path artifacts/reports/EUR_USD/cluster_assignments.csv \
  --output-dir artifacts/reports/EUR_USD/ \
  --save-csv \
  --save-heatmap \
  --save-json
This will:

Compute the Markov transition matrix from cluster sequences

Derive stickiness, entropy, and most-likely transitions per regime

Generate:

regime_decision_table.csv
transition_matrix.csv
transition_matrix_heatmap.png
regime_metadata.json (for runtime strategy filtering)
⚠️ --input-path must point to the cluster_assignments.csv generated by the cluster step. The interpret pipeline does not run embedding or clustering — it analyzes the regime structure from their output.

ℹ️ Note: This pipeline does not require a config file. It operates directly on a post-clustering output CSV with a Cluster_ID column.

🔹 Analyze Full Pipeline (Embed + Cluster)
python launch_host.py analyze \
  --instrument EUR_USD \
  --window-size 5 \
  --stride 1 \
  --encoding-method sinusoidal \
  --encoding-style interleaved \
  --embedding-dim 64 \
  --n-clusters 12 \
  --create-dir \
  --force \
  --clean
This single command:

Loads and expands a base config (e.g., configs/EUR_USD_base.yaml)
Dynamically resolves output paths for embeddings and clustering reports
Creates output directories if --create-dir is provided
Forces re-run even if output exists (--force)
Cleans existing embedding/report directories before rerun (--clean)
🛠 Outputs:

Embedding: artifacts/embeddings/.../embedding.npy
Clustering: artifacts/reports/.../cluster_assignments.csv
Auto-exported config: artifacts/tmp_config.yaml
🛠 Available CLI Arguments for analyze
Argument	Description
--instrument	Instrument symbol (e.g., EUR_USD)
--window-size	Rolling window size used for embedding
--stride	Step size between rolling windows
--encoding-method	Positional encoding method: sinusoidal or learnable
--encoding-style	Sinusoidal encoding style: interleaved or stacked
--embedding-dim	Dimensionality of the positional encoding
--n-clusters	Number of clusters for regime detection
--create-dir	Create output folders for embeddings and reports if they don’t exist
--force	Force re-run even if embedding or cluster outputs already exist
--clean	Remove previous output folders before running
--debug	Enable debug logging
🧪 Example Dataset
An example file is included at examples/EUR_USD_processed_signals.csv to help you test the pipeline immediately.

This file contains:

Processed technical indicators (AHMA, LP, LC, ATR, etc.)
Cleaned and aligned daily bars for EUR/USD
A ready-to-ingest format compatible with the full embedding_pipeline
You can run the ingestion pipeline on this dataset:

python launch_host.py ingest --signal-input-path examples/EUR_USD_processed_signals.csv
— OR —

Run the embedding pipeline to generate transformer embeddings:

python launch_host.py embed --signal-input-path examples/EUR_USD_processed_signals.csv
🛠️ Configuration Files
regimetry supports YAML configuration files to streamline pipeline execution and visualization setup. These configs centralize all key parameters used by the CLI and Dash dashboard.

📂 Example Config
Here's a fully annotated example config file at config/full_config.yaml:

# ✅ General Settings
debug: true

# ✅ Ingestion Settings
signal_input_path: ./examples/EUR_USD_processed_signals.csv
include_columns: "*"
exclude_columns: ["Date", "Hour"]  # Remove Date/Hour for daily resolution

deterministic: true                # Enables reproducible embeddings and clustering
random_seed: 42                    # Controls randomness for TF, t-SNE, UMAP, Spectral Clustering

# ✅ Embedding Settings
output_name: EUR_USD_embeddings.npy
window_size: 10
stride: 1
encoding_method: "sinusoidal"      # Options: 'sinusoidal', 'learnable'
encoding_style: "interleaved"      # Options: 'interleaved', 'stacked'
# embedding_dim: 80

# ✅ Clustering Settings
embedding_path: ./embeddings/EUR_USD_embeddings.npy
regime_data_path: ./data/processed/regime_input.csv
output_dir: ./reports/EUR_USD
n_clusters: 8

# ✅ Report Settings
report_format: ["matplotlib", "plotly"]  # Options: [], ["matplotlib"], ["plotly"]
report_palette: Set2                     # Any valid seaborn palette name
Your README.md is already outstanding — clean, modular, and informative. To reflect your recent changes, here’s a drop-in-ready update section you can patch under:

✅ Section: Configuration Files → Example Config
Update the example YAML to include the new deterministic settings:

# ✅ Embedding Settings
output_name: EUR_USD_embeddings.npy
window_size: 10
stride: 1
encoding_method: "learnable"       # Options: 'sinusoidal', 'learnable'
encoding_style: "interleaved"      # Used only for 'sinusoidal'

embedding_dim: 71                  # Required for 'learnable'; optional for 'sinusoidal'
deterministic: true                # Enables reproducible embeddings and clustering
random_seed: 42                    # Controls randomness for TF, t-SNE, UMAP, Spectral Clustering
🧬 Determinism Note:
When deterministic: true, all randomness (including Transformer, t-SNE, UMAP, Spectral Clustering) is locked using random_seed.
This ensures identical results across re-runs with the same input data.
When false, variability is allowed — useful for exploration or stress testing.

🔗 Learn more → Reproducibility Controls

🧠 Usage in CLI
You can run any pipeline stage using a config override:

python launch_host.py cluster --config config/full_config.yaml
CLI will auto-resolve relative paths (e.g., to ./data/, ./embeddings/)
Config values override internal defaults
Any CLI argument passed explicitly will override the config
✅ CLI flags always take precedence over values defined in the YAML.

🖼️ Usage in Dash App
The Dash dashboard can also load and preview a YAML config:

poetry run python -m dash_app.app
In the Palette Preview tab:

Upload any .yaml file

The dashboard will display:

Parsed settings (window_size, n_clusters, output_dir, etc.)
Current seaborn report_palette rendered as a color swatch
⚠️ This is for preview only — uploaded config does not affect the rendered plots. To change plots, rerun the cluster CLI with the updated config.

For a full reference of all supported fields, see: 📘 docs/CONFIG_REFERENCE_README.md

🖥️ Interactive Dashboard
regimetry ships with an optional Dash app that provides a user-friendly interface for exploring clustering results.

🚀 Launch the App
poetry run python -m dash_app.app
The app will run locally at http://localhost:8050

⚠️ Requires dash, dash-bootstrap-components, and plotly installed in your environment.

🧩 Features
📁 YAML Config Loader Upload a YAML config file (e.g., configs/full_config.yaml) to view the current settings:

window_size

report_palette

output_dir

report_format

🛈 This is for informational preview only — uploading a config file does not affect the rendered plots. Plots are static and must be regenerated via the CLI (launch_host.py cluster) if you want different parameters applied.

🧠 Cluster Visualizations

📉 Price Overlay: Close price with color-coded cluster markers
🌀 t-SNE: 2D projection of regime embedding space
🔮 UMAP: Alternative manifold-based view of clusters
🎨 Palette Preview

Auto-detects and displays the seaborn color palette in use
Ensures consistent cluster color mapping between matplotlib and Plotly
Preview updates when a new YAML config is uploaded
📂 Directory Structure
dash_app/
├── app.py               # Main Dash app with config reader and tab layout
├── ...
📦 Example Config for Palette Preview
report_format: ["matplotlib", "plotly"]
report_palette: "Set2"
output_dir: ./artifacts/reports/EUR_USD
🛠 Project Structure
regimetry/
├── models/               # Trained encoders and clustering artifacts
├── data/                 # Input raw / processed datasets
├── artifacts/            # JSON logs, regime labels, regime visual outputs
├── config.yaml           # Tunable pipeline settings
├── pyproject.toml
└── README.md
🧭 Orientation Going Forward
Start with regime labeling and visualization
Build diagnostic tools to analyze regime behavior
Eventually tie regime_id into strategy filters and signal validation
Keep architecture modular, interpretable, and ready for real-world integration
✅ Status
 Core concept defined
 Data ingestion pipeline implemented
 Transformer encoder + positional encoding embedded
 Embedding pipeline operational and CLI-integrated
 Embeddings saved to embeddings/
 Spectral clustering and regime ID assignment
 Visualization tools (UMAP, t-SNE) with cluster overlay
 Historical regime labeling and export
 Live inference support
 Contrastive or autoregressive pretraining options
🔗 Related Projects
ConvolutionLab:
A technical feature engineering framework that produces structured indicators (e.g., AHMA, LP, LC, ATR)
used as inputs to regimetry.
Note: While regimetry is compatible with ConvolutionLab outputs, it is not tightly coupled to it —
any feature-rich dataset with proper formatting can be used for embedding and clustering.
📖 Further Reading
For foundational papers, models, and tools behind the regimetry pipeline, see the References.

📄 License
MIT

👤 Author
\kjpou1 — Initial maintainer



https://github.com/wispcarey/AutoKG.git
AutoKG - Efficient Automated Knowledge Graph Generation for Large Language Models
Background & Motivation
Connecting large language models with specific knowledge bases enhances the accuracy and depth of the model's output. Currently, knowledge bases are primarily accessed through vector similarity search, which has limitations in retrieving complex associative information. Knowledge graphs can address these limitations by providing more complex reasoning and knowledge expansion. However, building and using knowledge graphs is relatively expensive and complex. These challenges have motivated us to consider a more lightweight approach to constructing knowledge graphs, one that does not require fine-tuning models or processing the entire corpus while offering the simplicity akin to the vector similarity method. This line of thinking has led to the development of our AutoKG project.

Introduction
We present a novel approach to efficiently build lightweight knowledge graphs based on existing knowledge bases, significantly reducing the complexities involved in leveraging knowledge graphs to enhance language models. Our strategy involves extracting key terms from the knowledge base and constructing a graph structure on these keywords. The edges in the graph are assigned a positive integer weight, representing the strength of association between two connected keywords within the entire corpus. Utilizing this graph structure, we have designed a hybrid search scheme that simultaneously conducts vector-similarity-based text search and graph-based strongly associated keyword search. All retrieved information is incorporated into the prompt to enhance the model's response. Please refer to our paper for more details.

Flowcharts
Here we use two flowcharts to illustrate our proposed automated KG construction method and mixture search method.

Keywords Extraction and KG Construction
Keywords Extraction and KG Construction

Mixture Search: Vector Similarity + KG
Mixture Search: Vector Similarity + KG

How to Use
Clone the Repository: git clone https://github.com/wispcarey/AutoKG.git
Prerequisites: Python 3.9 or 3.10
Installation: Install necessary packages:pip install -r requirements.txt
Your OpenAI API key: Input your openai api key in config
Chat with the Knowledge graph
We offer a concrete example to demonstrate how to construct a knowledge graph using our innovative method. We've downloaded a collection of research papers (in raw_data) related to building knowledge graphs using language models, and with these papers and our approach, we will show how to create a knowledge graph and use it to reinforce the performance of Language models.

The example is shown in two main Jupyter Notebooks:

create_KG.ipynb: This notebook illustrates how to extract keywords from the selected papers and generate a knowledge graph based on these keywords. The entire process is automated, intuitive, and easy to follow.
chat_with_KG.ipynb: This notebook provides an example of how to engage in question and answer interactions using the knowledge graph we've built. Through this example, users can understand how to apply the constructed knowledge graph to real language processing scenarios.
Citation
If you use this tool or data in your research, please cite our paper IEEE Xplore:

@inproceedings{chen2023autokg,
  title={AutoKG: Efficient Automated Knowledge Graph Generation for Language Models},
  author={Chen, Bohan and Bertozzi, Andrea L},
  booktitle={2023 IEEE International Conference on Big Data (BigData)},
  pages={3117--3126},
  year={2023},
  organization={IEEE}


  3rd one//////////////////


A drop-in gateway that sits between your application and your LLM providers and answers repeated questions from a semantic cache instead of paying for another inference call.

LLM-backed products see the same questions over and over, phrased differently: "What is Redis?", "Explain Redis to me", "what's redis used for". A normal key-value cache treats each of those as a miss, so every one of them costs money and takes seconds. This gateway embeds each incoming prompt, searches a vector index of previously answered prompts, and returns the stored answer when a close-enough match exists. Only genuinely new questions reach the model, and their answers are stored for next time.

The result is lower latency, lower cost, and higher throughput, with the similarity threshold as an explicit, measurable knob for trading hit rate against answer correctness. This repository includes the evaluation harness used to measure that trade-off, not just the cache.

Results at a glance
Metric	Value
Median latency(p50), cache hit vs. direct LLM call	4-5 ms,222ms vs. 2,939 – 7,142 ms
Overhead added on a cache miss (embedding + lookup)	100–200 ms
Recommended similarity threshold	0.3
Precision / recall at that threshold	95.16% / 73.75%
Full methodology and numbers: LATENCY_BENCHMARKS.MD and THRESHOLD_BENCHMARKS.MD.

Features
Semantic similarity caching on top of Redis Stack and RedisVL vector search
FastAPI gateway with a single chat-completions endpoint
Five LLMs behind one interface, selectable per request
Automatic cache population on misses
Configurable similarity threshold, benchmarked at 0.3, 0.5, 0.75 and 0.9
Evaluation framework: hit/miss ratio, precision, recall, accuracy, F1, confusion matrix, P50/P95/P99 latency, speedup over baseline
Dockerized: the whole stack starts with one command
Automated tests with GitHub Actions CI
Supported models
Pass one of these as llm_model in the request body.

llm_model	Provider
deepseek-flash-v4	OpenRouter
gemini_2.5_flash	OpenRouter
claude_haiku_4.5	OpenRouter
gpt_luna_pro	OpenRouter
gpt-oss-120b	Groq
Tech stack
Python 3.12, FastAPI, Pydantic
Redis Stack and RedisVL for vector search and cache storage
Sentence Transformers with redis/langcache-embed-v1 (Hugging Face) for embeddings
LangChain provider integrations (langchain-openrouter, langchain-groq)
Docker Compose for deployment
pytest and GitHub Actions for testing and CI
How it works
A client sends a prompt to the gateway.
The prompt is converted to a dense vector embedding.
RedisVL searches the index of previously cached prompts for the nearest neighbor.
If the distance is within the configured threshold, the stored response is returned immediately (cache hit).
Otherwise the request is routed to the selected LLM (cache miss).
The new response is written to the cache for future requests.
Architecture

Project structure
.
├── .github/workflows/ci.yml     # CI: tests against a Redis service container
├── app/
│   ├── api/                     # FastAPI routes
│   ├── benchmark_evaluation/
│   │   ├── benchmark.py
│   │   ├── evaluation_dataset.csv
│   │   └── faq_dataset.csv
│   ├── cache/                   # Semantic cache (RedisVL)
│   ├── config/                  # Settings and model names
│   ├── gateway/                 # Hit-or-forward decision logic
│   ├── metrics/                 # Evaluation metrics
│   ├── providers/               # LLM providers and model router
│   ├── schemas/                 # Pydantic request/response models
│   ├── utils/                   # Shared helpers
│   └── main.py                  # Application entry point
├── tests/
│   ├── test_cache.py
│   ├── test_chat_request.py
│   └── test_gateway.py
├── Diagram.png
├── Dockerfile
├── docker-compose.yml
├── image.png
├── LATENCY_BENCHMARKS.MD
├── Makefile
├── observations.txt
├── pytest.ini
├── README.MD
├── requirements.txt
└── THRESHOLD_BENCHMARKS.MD
What each part does
Path	Purpose
app/api/	FastAPI routes that expose the gateway to clients.
app/cache/	The semantic cache: embedding, vector lookup, insertion, and threshold matching on RedisVL.
app/gateway/	Decides whether to serve a cached response or forward to an LLM, then writes new answers back.
app/providers/	Provider clients and the Router that maps llm_model names to OpenRouter and Groq models.
app/schemas/	Request and response models shared across the API.
app/config/	Configuration and model identifiers.
app/metrics/	Computes hit ratio, precision, recall, F1, confusion matrix, and latency percentiles.
app/benchmark_evaluation/	Benchmark runner and datasets used to evaluate cache quality across thresholds.
app/utils/	Small helpers used across modules.
app/main.py	Initializes the FastAPI app.
tests/	Tests for the cache layer, gateway logic, and API route.
.github/workflows/ci.yml	Runs the test suite on every push and pull request.
THRESHOLD_BENCHMARKS.MD	Cache quality at similarity thresholds 0.3, 0.5, 0.75 and 0.9.
LATENCY_BENCHMARKS.MD	Our cache vs. baseline (direct LLM) latency comparison.
observations.txt	Working notes from experiments.
Dockerfile, docker-compose.yml	Container image for the gateway and the Redis Stack service.
Makefile	Shortcuts: make run, make test, make evaluate.
pytest.ini	Test discovery and import-path configuration.
Diagram.png, image.png	Architecture diagram and latency chart.
Getting started
Prerequisites
Docker and Docker Compose
Python 3.12 (only for running without Docker)
API keys for OpenRouter, Groq, and Hugging Face (see below)
1. Clone the repository
git clone https://github.com/AllenGeorge08/LLM-Semantic-Caching-Gateway.git
cd LLM-Semantic-Caching-Gateway
2. Configure environment variables
cp .env.example .env
Then fill in your keys:

OPENROUTER_API_KEY=   # DeepSeek, Gemini, Claude Haiku and GPT Luna Pro (via OpenRouter)
GROQ_API_KEY=         # gpt-oss-120b (via Groq)
HF_TOKEN=             # downloads the sentence-transformers embedding model from Hugging Face
The embedding model is redis/langcache-embed-v1.

3. Run it
With Docker (recommended): starts Redis Stack and the gateway together.

docker compose up --build
Without Docker for the app: start Redis, then run the gateway locally.

python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

docker compose up -d redis        # Redis Stack only
make run
The API is available at http://localhost:8000, with interactive Swagger docs at http://localhost:8000/docs.

4. Try it
curl -X POST http://localhost:8000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"llm_model": "gpt-oss-120b", "prompt": "What is a database and why is it used?"}'
Example response:

{
  "response": "...",
  "cache_hit": false,
  "similarity_score": null,
  "cache_latency": 73.1,
  "llm_latency": 2669.2
}
Send a rephrased version of the same question ("Why do we use databases?") and cache_hit becomes true, with the LLM latency gone.

Testing
make test
Tests run against a live Redis instance. CI (GitHub Actions) starts one as a service container.

Benchmarks
make evaluate
The evaluation runs a labeled set of repeated, paraphrased, and unrelated queries and reports:

Cache hit and miss ratio
Precision, recall, accuracy, and F1
Confusion matrix
Average cache latency vs. average LLM latency
P50 / P95 / P99 latency
Overall speedup
Two reports are included:

THRESHOLD_BENCHMARKS.MD: how hit rate, precision, and recall change at thresholds 0.3, 0.5, 0.75 and 0.9. A looser threshold serves more requests from cache but risks returning an answer to a different question; a stricter one is safer but saves less.
LATENCY_BENCHMARKS.MD: our cache vs. the baseline (direct LLM call), per model.
Latency comparison
Latency Benchmarks

Customer Churn Intelligence
An end-to-end machine learning decision system designed to identify customers at risk of churn and support proactive retention strategies.

The project moves beyond basic churn classification by combining predictive modeling, customer-level risk segmentation, explainable AI, a REST API, and an interactive decision dashboard.

Project Overview
Customer churn directly affects recurring revenue, customer lifetime value, and acquisition costs.

This system transforms customer behavioral and service data into actionable churn intelligence by:

Predicting individual customer churn probability
Segmenting customers into Low, Medium, High, and Critical risk groups
Identifying major churn drivers using SHAP explainability
Serving predictions through a FastAPI REST API
Providing an interactive Streamlit decision dashboard
Recommending retention actions based on predicted risk
System Architecture
Customer Data
      |
      v
Data Cleaning & Exploration
      |
      v
Feature Engineering
      |
      v
Machine Learning Pipeline
      |
      v
Churn Probability
      |
      +--------------------+
      |                    |
      v                    v
SHAP Explainability    Risk Segmentation
                           |
                           v
                     FastAPI REST API
                           |
                           v
                    Streamlit Dashboard
                           |
                           v
                  Retention Decisions
Technology Stack
Programming & Analytics

Python
pandas
NumPy
Jupyter Notebook
Machine Learning

scikit-learn
Classification modeling
Feature engineering
Probability-based churn prediction
Explainable AI

SHAP
API

FastAPI
Pydantic
Uvicorn
Application

Streamlit
Plotly
Development

VS Code
Git
GitHub
Project Structure
customer-churn-intelligence/
│
├── api/
│   ├── app.py
│   └── dashboard/
│       └── app.py
│
├── data/
│   ├── raw/
│   │   └── Telco-Customer-Churn.csv
│   └── processed/
│       └── telco_churn_cleaned.csv
│
├── models/
│   ├── churn_model.joblib
│   └── preprocessor.joblib
│
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   └── 02_feature_engineering.ipynb
│
├── reports/
│   └── customer_churn_risk_scores.csv
│
├── src/
│   ├── data/
│   ├── features/
│   ├── models/
│   └── monitoring/
│
├── .gitignore
├── requirements.txt
└── README.md
Machine Learning Workflow
1. Data Exploration
Customer demographic, account, service, contract, billing, and churn information is explored and cleaned before modeling.

2. Feature Engineering
The preprocessing pipeline transforms numerical and categorical customer attributes into model-ready features.

3. Churn Prediction
The trained classification model generates a churn probability for each customer rather than only producing a binary prediction.

4. Risk Segmentation
Customers are translated into business-friendly risk categories:

Churn Probability	Risk Level
< 25%	Low
25% – < 50%	Medium
50% – < 75%	High
≥ 75%	Critical
This enables retention teams to prioritize customers based on intervention urgency.

Explainable AI
SHAP is used to interpret model predictions and understand the variables influencing churn.

The analysis highlights influential customer characteristics such as:

Tenure
Monthly charges
Total charges
Internet service
Contract type
Billing characteristics
Customer service selections
Explainability helps transform the model from a prediction engine into a more interpretable decision-support system.

Customer Risk Scoring
The project generates customer-level risk results containing:

customerID
Churn_Probability
Risk_Level
Actual_Churn
These outputs can be used by retention, customer success, marketing, or analytics teams to prioritize customer outreach.

FastAPI Prediction Service
The trained machine learning pipeline is exposed through a REST API.

Endpoint
POST /predict
The API accepts customer information and returns results such as:

{
  "churn_probability": 0.567,
  "churn_prediction": 1,
  "risk_level": "High",
  "threshold": 0.25
}
This architecture allows the churn model to be integrated into other applications and business systems.

Interactive Churn Dashboard
A Streamlit application provides a user-facing interface for customer churn assessment.

Users can enter customer information and receive:

Churn probability
Risk classification
Churn prediction
Visual risk gauge
Recommended retention action
Business interpretation
Example
Churn Probability: 56.7%
Risk Level: High
Prediction: Likely to Churn
The system then recommends proactive retention intervention for the customer.

Business Value
Instead of treating every customer equally, this solution enables organizations to prioritize retention resources using predicted churn risk.

Potential business applications include:

Proactive customer retention
High-risk customer identification
Targeted loyalty incentives
Customer success prioritization
Contract optimization
Service experience investigation
Retention campaign targeting
Key Project Capabilities
End-to-end machine learning workflow
Customer-level churn probability
Risk-based customer segmentation
Explainable AI with SHAP
Automated preprocessing pipeline
Persisted machine learning artifacts
FastAPI prediction service
Interactive Streamlit dashboard
Business-focused retention recommendations
Run the Project
Install dependencies:

pip install -r requirements.txt
Start the FastAPI service:

uvicorn api.app:app --reload
API documentation is available locally through the FastAPI /docs endpoint.

In another terminal, start the Streamlit dashboard:

streamlit run api/dashboard/app.py
The application will then be available through the local Streamlit server.

Future Enhancements
Potential production enhancements include:

Model monitoring and drift detection
Automated model retraining
Cloud deployment
Batch customer scoring
Customer-level SHAP explanations
Experiment tracking
Retention campaign outcome tracking
Revenue-at-risk estimation
Customer lifetime value integration
Project Objective
The objective of Customer Churn Intelligence is not simply to predict churn.

It is to convert machine learning predictions into an actionable customer-retention workflow by connecting:

Data → Machine Learning → Explainability → API → Dashboard → Business Action