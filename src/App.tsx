import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "./components/ui/provider";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Lazy loading para páginas
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
const LoginTotvsPage = lazy(() => import("./pages/login-totvs"));
const HomePage = lazy(() => import("./pages/home"));
const ResponderPage = lazy(() => import("./pages/responder"));
const DashboardPage = lazy(() => import("./pages/dashboard"));

// Novas páginas de Avaliação Institucional
const CriarAvaliacaoPage = lazy(() => import("./app/pages/avaliacoes/criar-avaliacao"));
const EditarAvaliacaoPage = lazy(() => import("./pages/avaliacoes/editar/[id]"));
const AvaliacoesPage = lazy(() => import("./app/pages/avaliacoes"));
const ParticipantesAvaliacaoListaPage = lazy(() => import("./app/pages/avaliacoes/participantes-avaliacao-lista"));
const AdicionarParticipantesAvaliacaoPage = lazy(() => import("./app/pages/avaliacoes/participantes-avaliacao-adicionar"));

// Páginas de Gestão Acadêmica
const CursosPage = lazy(() => import("./app/pages/cursos"));
const InstituicoesPage = lazy(() => import("./app/pages/instituicoes"));
const PeriodosLetivosPage = lazy(() => import("./app/pages/periodos-letivos"));
const DisciplinasPage = lazy(() => import("./app/pages/disciplinas"));
const TurmasPage = lazy(() => import("./app/pages/turmas"));
const TurmaDisciplinaPage = lazy(() => import("./app/pages/turma-disciplina"));
const ProfessoresPage = lazy(() => import("./app/pages/professores"));
const AlunosPage = lazy(() => import("./app/pages/alunos/alunos.component"));

// Página de teste de questões condicionais
const TestConditionalQuestionsPage = lazy(() => import("./pages/test-conditional-questions"));

// Página de exemplo de avaliação institucional
const InstitutionalEvaluationExamplePage = lazy(() => import("./pages/institutional-evaluation-example"));

// Página FAQ/Manual
const FAQPage = lazy(() => import("./app/pages/faq/faq.component"));
const FAQAlunoPage = lazy(() => import("./app/pages/faq/faq-aluno.component"));
const FAQProfessorPage = lazy(() => import("./app/pages/faq/faq-professor.component"));

// Dashboards específicos por perfil
const AlunoDashboard = lazy(() => import("./pages/dashboards/aluno-dashboard"));
const ProfessorDashboard = lazy(() => import("./pages/dashboards/professor-dashboard"));
const CPADashboard = lazy(() => import("./pages/dashboards/cpa-dashboard"));

// Componente de roteamento por perfil
const ProfileRouter = lazy(() => import("./components/routing/ProfileRouter"));

const queryClient = new QueryClient();

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f7fafc'
      }}>
        <div>Verificando autenticação...</div>
      </div>
    );
  }
  
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
                  {/* Rotas públicas */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/login-totvs" element={<LoginTotvsPage />} />
                  <Route path="/responder" element={<ResponderPage />} />
                  <Route path="/questionario/:chave" element={<QuestionarioPorChavePage />} />
                  
                  {/* Rotas protegidas com MainLayout */}
                  <Route path="/" element={<ProtectedRoute><ProfileRouter><DashboardPage /></ProfileRouter></ProtectedRoute>} />
                  <Route path="/home" element={<ProtectedRoute><ProfileRouter><HomePage /></ProfileRouter></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><ProfileRouter><DashboardPage /></ProfileRouter></ProtectedRoute>} />
                  
                  {/* Sistema NPS (rotas existentes) */}
                  <Route path="/formularios" element={<ProtectedRoute><FormulariosPage /></ProtectedRoute>} />
                  <Route path="/create-form" element={<ProtectedRoute><CreateFormPage /></ProtectedRoute>} />
                  <Route path="/editar-formulario/:id" element={<ProtectedRoute><EditarFormularioPage /></ProtectedRoute>} />
                  <Route path="/excluir-formulario/:id" element={<ProtectedRoute><ExcluirFormularioPage /></ProtectedRoute>} />
                  <Route path="/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
                  <Route path="/create-question" element={<ProtectedRoute><CreateQuestionPage /></ProtectedRoute>} />
                  <Route path="/create-question/:id" element={<ProtectedRoute><CreateQuestionWithIdPage /></ProtectedRoute>} />
                  <Route path="/participantes" element={<ProtectedRoute><ParticipantesPage /></ProtectedRoute>} />
                  <Route path="/participantes/:id" element={<ProtectedRoute><EditarParticipantePage /></ProtectedRoute>} />
                  <Route path="/participantes-formulario/:id" element={<ProtectedRoute><ParticipantesFormularioPage /></ProtectedRoute>} />
                  <Route path="/respostas-formulario/:id" element={<ProtectedRoute><RespostasFormularioPage /></ProtectedRoute>} />
                  <Route path="/responder-formulario/:id" element={<ProtectedRoute><ResponderFormularioPage /></ProtectedRoute>} />
                  <Route path="/execution" element={<ProtectedRoute><ExecutionPage /></ProtectedRoute>} />
                  
                  {/* Avaliação Institucional */}
                  <Route path="/avaliacoes" element={<ProtectedRoute><AvaliacoesPage /></ProtectedRoute>} />
                  <Route path="/avaliacoes/criar" element={<ProtectedRoute><CriarAvaliacaoPage /></ProtectedRoute>} />
                  <Route path="/avaliacoes/editar/:id" element={<ProtectedRoute><EditarAvaliacaoPage /></ProtectedRoute>} />
                  <Route path="/avaliacoes/:id/participantes" element={<ProtectedRoute><ParticipantesAvaliacaoListaPage /></ProtectedRoute>} />
                  <Route path="/avaliacoes/:id/participantes/adicionar" element={<ProtectedRoute><AdicionarParticipantesAvaliacaoPage /></ProtectedRoute>} />
                  <Route path="/avaliacao-institucional" element={<ProtectedRoute><FormulariosPage /></ProtectedRoute>} />
                  
                  {/* Gestão Acadêmica */}
                  <Route path="/instituicoes" element={<ProtectedRoute><InstituicoesPage /></ProtectedRoute>} />
                  <Route path="/periodos-letivos" element={<ProtectedRoute><PeriodosLetivosPage /></ProtectedRoute>} />
                  <Route path="/cursos" element={<ProtectedRoute><CursosPage /></ProtectedRoute>} />
                  <Route path="/disciplinas" element={<ProtectedRoute><DisciplinasPage /></ProtectedRoute>} />
                  <Route path="/turmas" element={<ProtectedRoute><TurmasPage /></ProtectedRoute>} />
                  <Route path="/turma-disciplina" element={<ProtectedRoute><TurmaDisciplinaPage /></ProtectedRoute>} />
                  <Route path="/professores" element={<ProtectedRoute><ProfessoresPage /></ProtectedRoute>} />
                  <Route path="/alunos" element={<ProtectedRoute><AlunosPage /></ProtectedRoute>} />
                  
                  {/* Teste de Questões Condicionais */}
                  <Route path="/test-conditional-questions" element={<ProtectedRoute><TestConditionalQuestionsPage /></ProtectedRoute>} />
                  
                  {/* Página de exemplo de avaliação institucional */}
                  <Route path="/institutional-evaluation-example" element={<ProtectedRoute><InstitutionalEvaluationExamplePage /></ProtectedRoute>} />
                  
                  {/* FAQ/Manual */}
                  <Route path="/faq" element={<ProtectedRoute><FAQPage /></ProtectedRoute>} />
                  <Route path="/faq-aluno" element={<ProtectedRoute><FAQAlunoPage /></ProtectedRoute>} />
                  <Route path="/faq-professor" element={<ProtectedRoute><FAQProfessorPage /></ProtectedRoute>} />
                  
                  {/* Dashboards específicos por perfil */}
                  <Route path="/aluno/dashboard" element={<ProtectedRoute><ProfileRouter><AlunoDashboard /></ProfileRouter></ProtectedRoute>} />
                  <Route path="/professor/dashboard" element={<ProtectedRoute><ProfileRouter><ProfessorDashboard /></ProfileRouter></ProtectedRoute>} />
                  <Route path="/cpa/dashboard" element={<ProtectedRoute><ProfileRouter><CPADashboard /></ProfileRouter></ProtectedRoute>} />
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
