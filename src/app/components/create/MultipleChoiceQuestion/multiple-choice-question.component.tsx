import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { TfiAlignJustify } from "react-icons/tfi";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Box,
    Checkbox,
    HStack,
    Input,
    VStack
} from '@chakra-ui/react';
import { Control, useFieldArray, UseFormRegister } from 'react-hook-form';
import { FiTrash } from 'react-icons/fi';
import { FormSchemaType } from '@/app/features/create-question/useCreateQuestionForm';


export default function MultipleChoiceQuestion({ register, control, isMultipleChoice }: {
    register: UseFormRegister<FormSchemaType>;
    control: Control<FormSchemaType>;
    isMultipleChoice: boolean
}) {
    const { fields, append, remove, move } = useFieldArray<FormSchemaType>({
        name: `options`,
        control,
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    return (
        <Box mt={4} p={2} borderWidth="1px" borderRadius="md">
            <VStack align="stretch">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={({ active, over }) => {
                        if (active.id !== over?.id) {
                            const oldIndex = fields.findIndex(f => f.id === active.id);
                            const newIndex = fields.findIndex(f => f.id === over?.id);
                            move(oldIndex, newIndex);
                        }
                    }}
                >
                    <SortableContext
                        items={fields.map(field => field.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {fields.map((field, index) => (
                            <SortableItem
                                isMultipleChoice={isMultipleChoice}
                                key={field.id}
                                id={field.id}
                                index={index}
                                register={register}
                                name={`options.${index}`}
                                remove={() => remove(index)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                <Box>
                    <button
                        type="button"
                        onClick={() =>
                            append({ idOpcao: crypto.randomUUID(), texto: '', ordem: fields.length + 1, peso: 1 })
                        }
                    >
                        + Adicionar opção
                    </button>
                </Box>
            </VStack>
        </Box>
    );
}

function SortableItem({
    id,
    index,
    register,
    remove,
    isMultipleChoice
}: {
    id: string;
    index: number;
    name: string;
    register: UseFormRegister<FormSchemaType>;
    remove: () => void;
    isMultipleChoice: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <HStack
            ref={setNodeRef}
            style={style}
            {...attributes}
            borderWidth="1px"
            borderRadius="md"
            p={2}
        >
            <Box {...listeners} cursor="grab">
                <TfiAlignJustify />
            </Box>
            
            {isMultipleChoice && (
                <Checkbox.Root disabled>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                        <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label />
                </Checkbox.Root>
            )}

            <Input
                placeholder={`Opção ${index + 1}`}
                {...register(`options.${index}.texto`)}
            />
            <button
                type="button"
                onClick={remove}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'red'
                }}
                aria-label="Remover"
            >
                <FiTrash size={18} />
            </button>
        </HStack>
    );
}