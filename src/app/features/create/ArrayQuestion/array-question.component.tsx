import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  Button,
  HStack,
  Input,
  VStack,
  Text,
  Checkbox,
} from "@chakra-ui/react";
import { TfiAlignJustify } from "react-icons/tfi";
import {
  useFieldArray,
  Control,
  UseFormRegister,
  UseFormGetValues,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { FiTrash } from "react-icons/fi";
import { QuestionTypeEnum } from "../../../services/question";

interface OptionItem {
  id: string;
  texto: string;
  ordem: number;
  peso: number;
  ehColuna: boolean;
}

interface FormSchemaType {
  opcoes: OptionItem[];
  colunas: OptionItem[];
}

interface MatrixSchemaType {
  tipo: QuestionTypeEnum.MATRIX;
  texto: string;
  obrigatorio: boolean;
  isCondicional: boolean;
  opcoes: Array<OptionItem & {
    ativaCondicao?: boolean;
    questaoCondicionalId?: number;
  }>;
  colunas: Array<OptionItem & {
    ativaCondicao?: boolean;
    questaoCondicionalId?: number;
  }>;
}

export default function DualSortableFieldArray({
  register,
  control,
  setValue,
  getValues,
  errors,
}: {
  register: UseFormRegister<MatrixSchemaType>;
  control: Control<MatrixSchemaType>;
  getValues: UseFormGetValues<MatrixSchemaType>;
  setValue: UseFormSetValue<MatrixSchemaType>;
  errors: FieldErrors<MatrixSchemaType>;
}) {
  const options = useFieldArray({ control, name: "opcoes", keyName: "key" });
  const columns = useFieldArray({ control, name: "colunas", keyName: "key" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findList = (id: string) => {
    if (options.fields.find((f) => f.id === id)) return "opcoes";
    if (columns.fields.find((f) => f.id === id)) return "colunas";
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceName = findList(active.id as string);
    const targetName = findList(over.id as string);

    if (!sourceName || !targetName) return;

    const sourceItems = getValues(sourceName);
    const targetItems = getValues(targetName);

    const activeIndex = sourceItems.findIndex(
      (i) => i.id === active.id
    );
    const overIndex = targetItems.findIndex((i) => i.id === over.id);

    const [movedItem] = sourceItems.splice(activeIndex, 1);
    movedItem.ehColuna = targetName === "colunas";

    targetItems.splice(overIndex, 0, movedItem);

    setValue(sourceName, sourceItems);
    setValue(targetName, targetItems);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <HStack align="start" p={4} w="100%">
        <SortableFieldArray
          title="Linhas"
          name="opcoes"
          fields={options.fields}
          register={register}
          remove={options.remove} 
          append={options.append}
          control={control}
          errors={errors}
        />
        <SortableFieldArray
          title="Colunas"
          name="colunas"
          fields={columns.fields}
          register={register}
          remove={columns.remove}
          append={columns.append}
          control={control}
          errors={errors}
        />
      </HStack>
    </DndContext>
  );
}

function SortableFieldArray({
  title,
  name,
  fields,
  register,
  remove,
  append,
  control,
  errors,
}: {
  title: string;
  name: "opcoes" | "colunas";
  fields: OptionItem[];
  register: UseFormRegister<MatrixSchemaType>;
  control: Control<MatrixSchemaType>;
  remove: (index: number) => void;
  append: (item: OptionItem) => void;
  errors: FieldErrors<MatrixSchemaType>;
}) {
  return (
    <Box
      w="100%"
      p={4}
      border="1px solid #ccc"
      borderRadius="md"
      borderColor={fields.length === 0 ? "red" : ""}
    >
      <Text fontWeight="bold" mb={2}>
        {title}
      </Text>
      <SortableContext
        items={fields.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <VStack align="stretch">
          {fields.map((field, index) => (
            <SortableItem
              leftLabel={
                name === "opcoes" ? (
                  `${index + 1}.`
                ) : (
                  <Checkbox isDisabled />
                )
              }
              key={field.id}
              id={field.id}
              index={index}
              name={`${name}.${index}.texto`}
              register={register}
              remove={() => remove(index)}
              control={control}
              errors={errors}
            />
          ))}
        </VStack>
      </SortableContext>
      <Button
        mt={2}
        onClick={() => {
          const newItem = {
            id: crypto.randomUUID(),
            texto: "",
            ordem: fields.length + 1,
            peso: 0,
            ehColuna: name === "colunas"
          };
          append(newItem);
        }}
        size="sm"
        colorScheme="teal"
      >
        + Adicionar
      </Button>
    </Box>
  );
}

function SortableItem({
  id,
  index,
  name,
  register,
  leftLabel,
  remove,
  control,
  errors,
}: {
  id: string | number;
  index: number;
  name: `opcoes.${number}.texto` | `colunas.${number}.texto`;
  remove: () => void;
  register: UseFormRegister<MatrixSchemaType>;
  control: Control<MatrixSchemaType>;
  leftLabel: string | React.JSX.Element;
  errors: FieldErrors<MatrixSchemaType>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <HStack
      ref={setNodeRef}
      style={style}
      {...attributes}
      borderWidth="1px"
      borderRadius="md"
      p={2}
      bg="white"
    >
      <Box {...listeners} cursor="grab">
        <TfiAlignJustify />
      </Box>
      {leftLabel}
      <Input 
        placeholder={`Opção ${index + 1}`} 
        {...register(name)}
        isInvalid={
          ((errors?.opcoes && !!errors.opcoes[index]?.texto) || (errors?.colunas && !!errors.colunas[index]?.texto))
        }
      />

      <Button onClick={remove} size="sm" colorScheme="red" variant="ghost">
        <FiTrash />
      </Button>
    </HStack>
  );
}
