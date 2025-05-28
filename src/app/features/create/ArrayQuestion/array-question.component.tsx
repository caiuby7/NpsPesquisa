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
  Field,
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
import { OptionItem } from "@/app/services/form";
import {
  FormSchemaType,
  MatrixSchemaType,
} from "@/app/widgets/create-question/useCreateQuestionForm";

export default function DualSortableFieldArray({
  register,
  control,
  setValue,
  getValues,
  errors,
}: {
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
  getValues: UseFormGetValues<FormSchemaType>;
  setValue: UseFormSetValue<FormSchemaType>;
  errors: FieldErrors<MatrixSchemaType>;
}) {
  const options = useFieldArray({ control, name: "opcoes", keyName: "key" });
  const columns = useFieldArray({ control, name: "colunas", keyName: "key" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findList = (id: string) => {
    if (options.fields.find((f) => f.idOpcao === id)) return "opcoes";
    if (columns.fields.find((f) => f.idOpcao === id)) return "colunas";
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { active, over } = event as any;
    if (!over || active.id === over.id) return;

    const sourceName = findList(active.idOpcao);
    const targetName = findList(over.idOpcao);
    if (!sourceName || !targetName) return;

    const sourceItems = getValues(sourceName);
    const targetItems = getValues(targetName);

    const activeIndex = sourceItems.findIndex(
      (i) => i.idOpcao === active.idOpcao
    );
    const overIndex = targetItems.findIndex((i) => i.idOpcao === over.idOpcao);

    const [movedItem] = sourceItems.splice(activeIndex, 1);
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
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
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
        items={fields.map((item) => item.idOpcao)}
        strategy={verticalListSortingStrategy}
      >
        <VStack align="stretch">
          {fields.map((field, index) => (
            <SortableItem
              leftLabel={
                name === "opcoes" ? (
                  `${index + 1}.`
                ) : (
                  <Checkbox.Root disabled>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label />
                  </Checkbox.Root>
                )
              }
              key={field.idOpcao}
              id={field.idOpcao}
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
        onClick={() =>
          append({
            idOpcao: crypto.randomUUID(),
            texto: "",
            ordem: 0,
            peso: 0,
          })
        }
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
  errors,
}: {
  id: string;
  index: number;
  name: `opcoes.${number}.texto` | `colunas.${number}.texto`;
  remove: () => void;
  register: UseFormRegister<FormSchemaType>;
  control: Control<FormSchemaType>;
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
      <Field.Root
        invalid={
          ((errors?.opcoes && !!errors.opcoes[index]?.texto) || (errors?.colunas && !!errors.colunas[index]?.texto))
        }
      >
        <Input placeholder={`Opção ${index + 1}`} {...register(name)} />
      </Field.Root>

      <Button onClick={remove} size="sm" colorScheme="red" variant="ghost">
        <FiTrash />
      </Button>
    </HStack>
  );
}
