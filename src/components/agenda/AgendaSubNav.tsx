import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AgendaSubNavProps {
  value: string;
  onChange: (value: string) => void;
}

const AgendaSubNav = ({ value, onChange }: AgendaSubNavProps) => {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        <TabsTrigger value="hoje">Hoje</TabsTrigger>
        <TabsTrigger value="semana">Semana</TabsTrigger>
        <TabsTrigger value="audiencias">Audiências</TabsTrigger>
        <TabsTrigger value="reunioes">Reuniões</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AgendaSubNav;
