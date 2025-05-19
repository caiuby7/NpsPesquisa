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
import { useFieldArray } from 'react-hook-form';
import { FiTrash } from 'react-icons/fi';

type Option = {
    id: string;
    label: string;
    correct: boolean;
};

export default function MultipleChoiceQuestion({ register, control, element }: { register: any, control: any, element: number }) {
    const { fields, append, remove, move } = useFieldArray({
        name: `questions.${element}.options`,
        control,
    });

    console.log(fields)

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
                        console.log(active.id, over?.id)
                        if (active.id !== over?.id) {
                            const oldIndex = fields.findIndex(f => f.id === active.id);
                            const newIndex = fields.findIndex(f => f.id === over?.id);
                            console.log(oldIndex, "old")
                            console.log(newIndex, "newIndex")
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
                                key={field.id}
                                id={field.id}
                                index={index}
                                register={register}
                                name={`${name}.options.${index}`}
                                remove={() => remove(index)}
                                element={element}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                <Box>
                    <button
                        type="button"
                        onClick={() =>
                            append({ id: crypto.randomUUID(), label: '', correct: false })
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
    name,
    register,
    remove,
    element
}: {
    id: string;
    index: number;
    name: string;
    register: any;
    remove: () => void;
    element: number;
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
            <Checkbox.Root {...register(`${name}.correct`)} disabled>
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                    <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label />
            </Checkbox.Root>
            <Input
                placeholder={`Opção ${index + 1}`}
                {...register(`questions.${element}.options.${index}.label`)}
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