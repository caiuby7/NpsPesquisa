import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "./components/ui/provider";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Lazy loading para páginas
const CursosPage = lazy(() => import("./pages/cursos"));
const FormulariosPage = lazy(() => import("./pages/formularios"));
const ParticipantesPage = lazy(() => import("./pages/participantes"));
const ParticipantesFormularioPage = lazy(() => import("./pages/participantes-formulario/[id]"));
const RespostasFormularioPage = lazy(() => import("./pages/respostas-formulario/[id]"));
const ResponderFormularioPage = lazy(() => import("./pages/responder-formulario/[id]"));
const QuestionarioPorChavePage = lazy(() => import("./pages/questionario/[chave]"));
const ExecutionPage = lazy(() => import("./pages/execution"));
const EditarParticipantePage = lazy(() => import("./pages/participantes/[id]"));
const CreateFormPage = lazy(() => import("./pages/create-form"));
const EditarFormularioPage = lazy(() => import("./pages/editar-formulario/[id]"));
const ExcluirFormularioPage = lazy(() => import("./pages/excluir-formulario/[id]"));
const CreateQuestionPage = lazy(() => import("./pages/create-question"));
const CreateQuestionWithIdPage = lazy(() => import("./pages/create-question/[id]"));
const QuestionsPage = lazy(() => import("./pages/questions"));
const LoginPage = lazy(() => import("./pages/login"));
const HomePage = lazy(() => import("./pages/home"));
const ResponderPage = lazy(() => import("./pages/responder"));

const queryClient = new QueryClient();

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Componente de fallback para Suspense
const LoadingFallback = () => <div>Carregando...</div>;

// Componente de fallback para ErrorBoundary
const ErrorFallback = ({ error }: { error: Error }) => (
  <div>
    <h1>Algo deu errado!</h1>
    <pre>{error.message}</pre>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <AuthProvider>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Router>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/responder" element={<ResponderPage />} />
                  <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path="/" element={<ProtectedRoute><FormulariosPage /></ProtectedRoute>} />
                  <Route path="/cursos" element={<ProtectedRoute><CursosPage /></ProtectedRoute>} />
                  <Route path="/formularios" element={<ProtectedRoute><FormulariosPage /></ProtectedRoute>} />
                  <Route path="/participantes" element={<ProtectedRoute><ParticipantesPage /></ProtectedRoute>} />
                  <Route path="/participantes/:id" element={<ProtectedRoute><EditarParticipantePage /></ProtectedRoute>} />
                  <Route path="/participantes-formulario/:id" element={<ProtectedRoute><ParticipantesFormularioPage /></ProtectedRoute>} />
                  <Route path="/respostas-formulario/:id" element={<ProtectedRoute><RespostasFormularioPage /></ProtectedRoute>} />
                  <Route path="/responder-formulario/:id" element={<ProtectedRoute><ResponderFormularioPage /></ProtectedRoute>} />
                  <Route path="/questionario/:chave" element={<QuestionarioPorChavePage />} />
                  <Route path="/execution" element={<ProtectedRoute><ExecutionPage /></ProtectedRoute>} />
                  <Route path="/create-form" element={<ProtectedRoute><CreateFormPage /></ProtectedRoute>} />
                  <Route path="/editar-formulario/:id" element={<ProtectedRoute><EditarFormularioPage /></ProtectedRoute>} />
                  <Route path="/excluir-formulario/:id" element={<ProtectedRoute><ExcluirFormularioPage /></ProtectedRoute>} />
                  <Route path="/create-question" element={<ProtectedRoute><CreateQuestionPage /></ProtectedRoute>} />
                  <Route path="/create-question/:id" element={<ProtectedRoute><CreateQuestionWithIdPage /></ProtectedRoute>} />
                  <Route path="/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
                </Routes>
              </Suspense>
            </Router>
          </ErrorBoundary>
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  );
}

export default App; 