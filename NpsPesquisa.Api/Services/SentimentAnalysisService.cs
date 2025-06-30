using Microsoft.ML;
using Microsoft.ML.Data;
using System.Collections.Generic;

namespace NpsPesquisa.Api.Services
{
    public class SentimentData
    {
        public string Text { get; set; }
        public bool Label { get; set; } // true = positivo, false = negativo
    }

    public class SentimentPrediction
    {
        [ColumnName("PredictedLabel")]
        public bool Prediction { get; set; }
        public float Probability { get; set; }
        public float Score { get; set; }
    }

    public class SentimentAnalysisService
    {
        private readonly MLContext _mlContext;
        private readonly ITransformer _model;

        public SentimentAnalysisService()
        {
            _mlContext = new MLContext();
            // Pequeno dataset de exemplo em português
            var trainingData = new List<SentimentData>
            {
                new SentimentData { Text = "Ótimo curso", Label = true },
                new SentimentData { Text = "Muito bom", Label = true },
                new SentimentData { Text = "Excelente", Label = true },
                new SentimentData { Text = "Gostei muito", Label = true },
                new SentimentData { Text = "Recomendo", Label = true },
                new SentimentData { Text = "Amei", Label = true },
                new SentimentData { Text = "Bom", Label = true },
                new SentimentData { Text = "Legal", Label = true },
                new SentimentData { Text = "Ruim", Label = false },
                new SentimentData { Text = "Péssimo", Label = false },
                new SentimentData { Text = "Horrível", Label = false },
                new SentimentData { Text = "Não gostei", Label = false },
                new SentimentData { Text = "Odiei", Label = false },
                new SentimentData { Text = "Muito ruim", Label = false },
                new SentimentData { Text = "Decepcionante", Label = false },
                new SentimentData { Text = "Fraco", Label = false },
            };
            var data = _mlContext.Data.LoadFromEnumerable(trainingData);
            var pipeline = _mlContext.Transforms.Text.FeaturizeText("Features", nameof(SentimentData.Text))
                .Append(_mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(labelColumnName: "Label", featureColumnName: "Features"));
            _model = pipeline.Fit(data);
        }

        public string Predict(string text)
        {
            var engine = _mlContext.Model.CreatePredictionEngine<SentimentData, SentimentPrediction>(_model);
            var prediction = engine.Predict(new SentimentData { Text = text });
            return prediction.Prediction ? "Positive" : "Negative";
        }
    }
} 