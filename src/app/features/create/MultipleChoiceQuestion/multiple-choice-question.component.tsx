import { Box, Checkbox, FormControl, HStack, Input, VStack, Button } from "@chakra-ui/react";
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
}

export default function MultipleChoiceQuestion({
  register,
  control,
  errors,
  index,
  isMultipleChoice = false,
}: Props) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "opcoes",
  });

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
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <HStack>
        <Button
          type="button"
          onClick={() => append({ texto: "", id: Date.now().toString(), ordem: fields.length + 1, peso: 0, ehColuna: false })}
          size="sm"
          colorScheme="teal"
        >
          + Adicionar
        </Button>
      </HStack>
    </VStack>
  );
}
