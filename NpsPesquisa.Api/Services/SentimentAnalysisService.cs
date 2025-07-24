using Microsoft.ML;
using Microsoft.ML.Data;
using System.Collections.Generic;
using System.Linq;

namespace NpsPesquisa.Api.Services
{
    public class SentimentData
    {
        public string Text { get; set; }
        public string Label { get; set; } // Muito negativo, Negativo, Neutro, Positivo, Muito positivo
    }

    public class SentimentPrediction
    {
        [ColumnName("PredictedLabel")]
        public string Prediction { get; set; }
        public float Probability { get; set; }
        [ColumnName("Score")]
        public float[] Score { get; set; } // Vetor de scores para cada categoria
    }

    public class SentimentAnalysisService
    {
        private readonly MLContext _mlContext;
        private readonly ITransformer _model;

        public SentimentAnalysisService()
        {
            _mlContext = new MLContext();
            // Dataset de exemplo em português com mais categorias
            var trainingData = new List<SentimentData>
            {
                // Muito positivo
                new SentimentData { Text = "Ótimo curso", Label = "Muito positivo" },
                new SentimentData { Text = "Muito bom", Label = "Muito positivo" },
                new SentimentData { Text = "Excelente", Label = "Muito positivo" },
                new SentimentData { Text = "Amei", Label = "Muito positivo" },
                new SentimentData { Text = "Perfeito", Label = "Muito positivo" },
                new SentimentData { Text = "Fantástico", Label = "Muito positivo" },
                new SentimentData { Text = "Maravilhoso", Label = "Muito positivo" },
                
                // Positivo
                new SentimentData { Text = "Gostei muito", Label = "Positivo" },
                new SentimentData { Text = "Recomendo", Label = "Positivo" },
                new SentimentData { Text = "Bom", Label = "Positivo" },
                new SentimentData { Text = "Legal", Label = "Positivo" },
                new SentimentData { Text = "Satisfeito", Label = "Positivo" },
                new SentimentData { Text = "Aprovado", Label = "Positivo" },
                
                // Neutro
                new SentimentData { Text = "Regular", Label = "Neutro" },
                new SentimentData { Text = "Mais ou menos", Label = "Neutro" },
                new SentimentData { Text = "Aceitável", Label = "Neutro" },
                new SentimentData { Text = "Normal", Label = "Neutro" },
                new SentimentData { Text = "Mediano", Label = "Neutro" },
                
                // Negativo
                new SentimentData { Text = "Ruim", Label = "Negativo" },
                new SentimentData { Text = "Não gostei", Label = "Negativo" },
                new SentimentData { Text = "Fraco", Label = "Negativo" },
                new SentimentData { Text = "Insatisfeito", Label = "Negativo" },
                new SentimentData { Text = "Decepcionante", Label = "Negativo" },
                new SentimentData { Text = "Mau", Label = "Negativo" },
                
                // Muito negativo
                new SentimentData { Text = "Péssimo", Label = "Muito negativo" },
                new SentimentData { Text = "Horrível", Label = "Muito negativo" },
                new SentimentData { Text = "Odiei", Label = "Muito negativo" },
                new SentimentData { Text = "Muito ruim", Label = "Muito negativo" },
                new SentimentData { Text = "Terrível", Label = "Muito negativo" },
                new SentimentData { Text = "Abominável", Label = "Muito negativo" },
            };
            
            var data = _mlContext.Data.LoadFromEnumerable(trainingData);
            var pipeline = _mlContext.Transforms.Text.FeaturizeText("Features", nameof(SentimentData.Text))
                .Append(_mlContext.Transforms.Conversion.MapValueToKey("Label"))
                .Append(_mlContext.MulticlassClassification.Trainers.SdcaMaximumEntropy(labelColumnName: "Label", featureColumnName: "Features"))
                .Append(_mlContext.Transforms.Conversion.MapKeyToValue("PredictedLabel"));
            _model = pipeline.Fit(data);
        }

        public string Predict(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return "Neutro";
                
            var engine = _mlContext.Model.CreatePredictionEngine<SentimentData, SentimentPrediction>(_model);
            var prediction = engine.Predict(new SentimentData { Text = text });
            
            // Fallback para análise simples baseada em palavras-chave
            if (prediction.Prediction == null)
            {
                var lowerText = text.ToLower();
                
                if (lowerText.Contains("ótimo") || lowerText.Contains("excelente") || lowerText.Contains("perfeito") || 
                    lowerText.Contains("fantástico") || lowerText.Contains("maravilhoso") || lowerText.Contains("amei"))
                    return "Muito positivo";
                    
                if (lowerText.Contains("bom") || lowerText.Contains("gostei") || lowerText.Contains("recomendo") || 
                    lowerText.Contains("satisfeito") || lowerText.Contains("aprovado"))
                    return "Positivo";
                    
                if (lowerText.Contains("péssimo") || lowerText.Contains("horrível") || lowerText.Contains("odiei") || 
                    lowerText.Contains("terrível") || lowerText.Contains("abominável"))
                    return "Muito negativo";
                    
                if (lowerText.Contains("ruim") || lowerText.Contains("fraco") || lowerText.Contains("decepcionante") || 
                    lowerText.Contains("insatisfeito") || lowerText.Contains("mau"))
                    return "Negativo";
                    
                return "Neutro";
            }
            
            return prediction.Prediction;
        }
    }
} 