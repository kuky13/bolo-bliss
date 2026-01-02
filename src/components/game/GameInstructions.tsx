
import React from 'react';
import { Gamepad2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const GameInstructions: React.FC = () => {
  return (
    <div className="mb-6">
      <Accordion type="single" collapsible className="bg-white rounded-lg shadow-md border border-gray-200">
        <AccordionItem value="instructions" className="border-b-0">
          <AccordionTrigger className="px-4 py-3 text-store-pink hover:no-underline">
            <span className="flex items-center">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Como Jogar
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 text-gray-700">
            <div className="space-y-3">
              <p><strong>Objetivo:</strong> Organizar os números em ordem crescente, deixando o espaço vazio no canto inferior direito.</p>
              
              <div>
                <p className="font-medium mb-1">Como mover as peças:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Clique em uma peça adjacente ao espaço vazio para movê-la</li>
                  <li>Use as setas do teclado para mover as peças</li>
                  <li>Em dispositivos móveis, deslize na direção desejada</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium mb-1">Níveis de dificuldade:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><span className="font-medium">Fácil:</span> Grade 3×3 (8 peças)</li>
                  <li><span className="font-medium">Médio:</span> Grade 4×4 (15 peças)</li>
                  <li><span className="font-medium">Difícil:</span> Grade 5×5 (24 peças)</li>
                </ul>
              </div>
              
              <p><strong>Dica:</strong> Tente resolver primeiro as linhas superiores, depois foque nas peças restantes.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default GameInstructions;
