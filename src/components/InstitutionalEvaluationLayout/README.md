# InstitutionalEvaluationLayout

Componente React para exibir avaliações institucionais com layout similar ao mock HTML fornecido.

## Características

- **Layout Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Barra de Progresso**: Mostra o progresso da avaliação
- **Cards de Disciplinas**: Cada disciplina é exibida em um card separado
- **Tabela de Matriz**: Avaliação em formato de tabela com radio buttons
- **Navegação**: Botões de anterior/próximo
- **Validação**: Impede avanço sem completar todas as questões
- **Tema**: Suporte a modo claro/escuro do Chakra UI

## Uso

```tsx
import InstitutionalEvaluationLayout from './components/InstitutionalEvaluationLayout';
import { useInstitutionalEvaluation } from './hooks/useInstitutionalEvaluation';

const MyComponent = () => {
  const disciplines = [
    {
      id: 'poo',
      name: 'Programação Orientada a Objetos',
      icon: 'book',
      aspects: [
        'Qualidade do conteúdo',
        'Metodologia de ensino',
        'Disponibilidade do professor',
        'Recursos disponíveis',
        'Avaliação e feedback'
      ]
    }
    // ... mais disciplinas
  ];

  const {
    evaluationData,
    currentSection,
    totalSections,
    progress,
    isNextDisabled,
    handleEvaluationChange,
    handleNext,
    handlePrevious
  } = useInstitutionalEvaluation({
    disciplines,
    onEvaluationComplete: (data) => {
      console.log('Avaliação concluída:', data);
    }
  });

  return (
    <InstitutionalEvaluationLayout
      title="Avaliação Institucional"
      subtitle="Católica SC - 2024.1"
      progress={progress}
      totalSections={totalSections}
      currentSection={currentSection}
      disciplines={disciplines}
      evaluationData={evaluationData}
      onEvaluationChange={handleEvaluationChange}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
    />
  );
};
```

## Props

### InstitutionalEvaluationLayout

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `title` | `string` | Sim | Título da avaliação |
| `subtitle` | `string` | Sim | Subtítulo da avaliação |
| `progress` | `number` | Sim | Progresso da avaliação (0-100) |
| `totalSections` | `number` | Sim | Total de seções |
| `currentSection` | `number` | Sim | Seção atual |
| `disciplines` | `Discipline[]` | Sim | Array de disciplinas |
| `evaluationData` | `EvaluationData[]` | Sim | Dados das avaliações |
| `onEvaluationChange` | `(disciplineId: string, aspectId: string, value: string) => void` | Sim | Callback para mudanças na avaliação |
| `onPrevious` | `() => void` | Sim | Callback para botão anterior |
| `onNext` | `() => void` | Sim | Callback para botão próximo |
| `isNextDisabled` | `boolean` | Não | Se o botão próximo está desabilitado |

### Discipline

```tsx
interface Discipline {
  id: string;
  name: string;
  icon: string; // Nome do ícone (book, database, globe, etc.)
  aspects: string[];
}
```

### EvaluationData

```tsx
interface EvaluationData {
  disciplineId: string;
  aspectId: string;
  value: string; // '1', '2', '3', '4', '5'
}
```

## Hook useInstitutionalEvaluation

O hook `useInstitutionalEvaluation` gerencia o estado da avaliação e fornece funções utilitárias.

### Retorno

```tsx
{
  evaluationData: EvaluationData[];
  currentSection: number;
  totalSections: number;
  progress: number;
  isNextDisabled: boolean;
  handleEvaluationChange: (disciplineId: string, aspectId: string, value: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  getDisciplineProgress: (disciplineId: string) => number;
  getEvaluationValue: (disciplineId: string, aspectId: string) => string;
  resetEvaluation: () => void;
}
```

## Ícones Disponíveis

- `book` - Livro
- `database` - Banco de dados
- `globe` - Desenvolvimento web
- `smartphone` - Desenvolvimento mobile
- `shield` - Segurança
- `cpu` - Inteligência artificial
- `bar-chart` - Estatística

## Exemplo Completo

Veja o arquivo `form-builder/src/pages/institutional-evaluation-example/index.tsx` para um exemplo completo de implementação.

## Acessibilidade

- Radio buttons com labels apropriados
- Navegação por teclado
- Contraste adequado para modo claro/escuro
- Texto alternativo para ícones

## Responsividade

- Layout adaptativo para mobile
- Tabelas com scroll horizontal em telas pequenas
- Botões com tamanho adequado para touch
- Espaçamento otimizado para diferentes dispositivos
