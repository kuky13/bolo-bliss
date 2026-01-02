
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { FileText, Coffee, Lightbulb, ExternalLink } from "lucide-react";

/**
 * EditHelpGuide - Componente com guias de ajuda para edição de conteúdo
 * 
 * Este componente fornece instruções detalhadas sobre como editar
 * diferentes tipos de conteúdo no sistema.
 */
const EditHelpGuide = () => {
  return (
    <Card className="shadow-md animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <FileText className="h-5 w-5" />
          Guia de Edição de Conteúdo
        </CardTitle>
        <CardDescription className="text-blue-700">
          Instruções passo a passo para editar o conteúdo do seu site
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="produtos">
            <AccordionTrigger className="text-primary font-medium">
              Como editar produtos
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p className="leading-relaxed text-gray-700">
                Para editar produtos, você tem duas opções:
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium mb-2 text-gray-800">Opção 1: Usando o painel administrativo</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Navegue até a página "Produtos" no painel administrativo</li>
                  <li>Clique no produto que deseja editar</li>
                  <li>Altere as informações nos campos apresentados</li>
                  <li>Clique em "Salvar" para confirmar as alterações</li>
                </ol>
              </div>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium mb-2 text-gray-800">Opção 2: Editando o arquivo JSON</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Navegue até a pasta <code className="bg-gray-100 px-1 py-0.5 rounded">src/data</code></li>
                  <li>Abra o arquivo <code className="bg-gray-100 px-1 py-0.5 rounded">initialProducts.json</code></li>
                  <li>Encontre o produto que deseja editar</li>
                  <li>Altere os valores conforme necessário</li>
                  <li>Salve o arquivo</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="configuracoes">
            <AccordionTrigger className="text-primary font-medium">
              Como editar configurações
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p className="leading-relaxed text-gray-700">
                Para editar as configurações gerais da loja:
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium mb-2 text-gray-800">Opção 1: Usando o painel administrativo</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Navegue até a página "Configurações" no painel administrativo</li>
                  <li>Altere as informações nos campos apresentados</li>
                  <li>Clique em "Salvar Configurações" para confirmar</li>
                </ol>
              </div>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium mb-2 text-gray-800">Opção 2: Editando o arquivo JSON</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Navegue até a pasta <code className="bg-gray-100 px-1 py-0.5 rounded">src/data</code></li>
                  <li>Abra o arquivo <code className="bg-gray-100 px-1 py-0.5 rounded">defaultSettings.json</code></li>
                  <li>Altere os valores conforme necessário</li>
                  <li>Salve o arquivo</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="imagens">
            <AccordionTrigger className="text-primary font-medium">
              Como adicionar imagens
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p className="leading-relaxed text-gray-700">
                Para adicionar imagens aos seus produtos:
              </p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Opção 1: Usando imagens online</h4>
                <p className="text-gray-600">
                  A maneira mais fácil é usar imagens que já estão online. Você pode:
                </p>
                
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Fazer upload de suas imagens para serviços como Google Drive, Imgur, ou Cloudinary</li>
                  <li>Obter o link direto da imagem</li>
                  <li>Usar esse link no campo "imageUrl" do produto</li>
                </ol>
                
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-start">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-blue-800">
                    <strong>Dica:</strong> Para obter um link direto de uma imagem do Google Drive, você precisará 
                    ajustar as configurações de compartilhamento e usar um formato de URL específico.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="categorias">
            <AccordionTrigger className="text-primary font-medium">
              Como criar e editar categorias
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p className="leading-relaxed text-gray-700">
                As categorias são definidas diretamente nos produtos. Para criar uma nova categoria:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Edite um produto existente ou crie um novo</li>
                <li>No campo "category", digite o nome da nova categoria</li>
                <li>Salve o produto</li>
                <li>A nova categoria será automaticamente criada e exibida no site</li>
              </ol>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-start">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>Dica:</strong> Para manter seu site organizado, tente usar as mesmas categorias 
                  para produtos similares e verifique a ortografia para evitar categorias duplicadas.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="ajuda">
            <AccordionTrigger className="text-primary font-medium">
              Onde encontrar mais ajuda
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p className="leading-relaxed text-gray-700">
                Se você precisar de mais ajuda:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Consulte o arquivo README.md na pasta src/data</li>
                <li>Entre em contato com o administrador do sistema</li>
                <li>Consulte a documentação online</li>
              </ul>
              
              <div className="flex justify-center mt-4">
                <Link 
                  to="/admin/settings"
                  className="inline-flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-primary/80 to-primary text-white hover:opacity-90 transition-opacity"
                >
                  <Coffee className="h-4 w-4" />
                  Ir para Configurações
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default EditHelpGuide;
