import { Box, Checkbox, FormControl, HStack, Input, VStack, Button, Select, Text } from "@chakra-ui/react";
import {
  Control,
  FieldErrors,
  UseFormRegister,
  useFieldArray,
} from "react-hook-form";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FormSchemaType,
  MultipleChoiceSchemaType,
} from "../../../widgets/create-question/useCreateQuestionForm";
import { GripVertical } from "lucide-react";
import { FiTrash } from "react-icons/fi";
import { useGetQuestions } from "../../../services/question";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <HStack>
        <div {...listeners} style={{ cursor: "grab" }}>
          <GripVertical size={16} />
        </div>
        {children}
      </HStack>
    </div>
  );
}

interface Props {
  register: UseFormRegister<MultipleChoiceSchemaType>;
  control: Control<MultipleChoiceSchemaType>;
  errors: FieldErrors<MultipleChoiceSchemaType>;
  index: number;
  isMultipleChoice?: boolean;
  isCondicional?: boolean;
}

export default function MultipleChoiceQuestion({
  register,
  control,
  errors,
  index,
  isMultipleChoice = false,
  isCondicional = false,
}: Props) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "opcoes",
  });

  const { data: questions } = useGetQuestions();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, optionIndex) => (
            <SortableItem key={field.id} id={field.id}>
              <VStack spacing={2} align="stretch" p={3} borderWidth="1px" borderRadius="md">
                <FormControl isInvalid={!!errors?.opcoes?.[optionIndex]?.texto}>
                  <HStack>
                    <Checkbox
                      isDisabled={isMultipleChoice}
                      {...register(`opcoes.${optionIndex}.texto`)}
                    />
                    <Input
                      placeholder="Opção"
                      {...register(`opcoes.${optionIndex}.texto`)}
                    />
                    <Button
                      onClick={() => remove(optionIndex)}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                    >
                      <FiTrash />
                    </Button>
                  </HStack>
                </FormControl>
                
                {isCondicional && (
                  <VStack spacing={2} align="stretch" pl={6}>
                    <FormControl>
                      <HStack>
                        <Checkbox
                          {...register(`opcoes.${optionIndex}.ativaCondicao`)}
                        />
                        <Text fontSize="sm" color="gray.600">
                          Ativa condição
                        </Text>
                      </HStack>
                    </FormControl>
                    
                    <FormControl>
                      <Select
                        placeholder="Selecione a questão condicional"
                        {...register(`opcoes.${optionIndex}.questaoCondicionalId`)}
                        size="sm"
                      >
                        {questions?.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.texto}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </VStack>
                )}
              </VStack>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <HStack>
        <Button
          type="button"
          onClick={() => append({ 
            texto: "", 
            id: Date.now().toString(), 
            ordem: fields.length + 1, 
            peso: 0, 
            ehColuna: false,
            ativaCondicao: false,
            questaoCondicionalId: undefined
          })}
          size="sm"
          colorScheme="teal"
        >
          + Adicionar
        </Button>
      </HStack>
    </VStack>
  );
}
