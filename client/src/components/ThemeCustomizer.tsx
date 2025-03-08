import { useState } from "react";
import { useThemeCustomizer } from "@/hooks/useThemeCustomizer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Paintbrush, Plus, Save, Trash } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeCustomizer() {
  const {
    activeTheme,
    allThemes,
    customThemes,
    presetThemes,
    setTheme,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
  } = useThemeCustomizer();

  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<number | null>(null);

  const [newTheme, setNewTheme] = useState({
    name: "",
    scheme: {
      name: "",
      primaryColor: "#3b82f6",
      secondaryColor: "#f1f5f9",
      accentColor: "#e2e8f0",
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
    },
    isDark: false,
  });

  const handleColorChange = (field: string, value: string) => {
    setNewTheme((prev) => ({
      ...prev,
      scheme: {
        ...prev.scheme,
        [field]: value,
      },
    }));
  };

  const handleSaveTheme = () => {
    if (editingTheme !== null && editingTheme < customThemes.length) {
      updateCustomTheme(editingTheme, {
        ...newTheme,
        scheme: { ...newTheme.scheme, name: newTheme.name },
      });
    } else {
      addCustomTheme({
        ...newTheme,
        scheme: { ...newTheme.scheme, name: newTheme.name },
      });
    }
    resetThemeForm();
  };

  const startEditTheme = (index: number) => {
    const theme = customThemes[index];
    setNewTheme({
      name: theme.name,
      scheme: { ...theme.scheme },
      isDark: theme.isDark,
    });
    setEditingTheme(index);
    setIsCreating(true);
  };

  const resetThemeForm = () => {
    setNewTheme({
      name: "",
      scheme: {
        name: "",
        primaryColor: "#3b82f6",
        secondaryColor: "#f1f5f9",
        accentColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        textColor: "#0f172a",
      },
      isDark: false,
    });
    setEditingTheme(null);
    setIsCreating(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Paintbrush className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Theme</DialogTitle>
          <DialogDescription>
            Choose a preset theme or create your own custom theme.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="browse">Browse Themes</TabsTrigger>
            <TabsTrigger value="create">Create Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <h3 className="text-sm font-medium">Preset Themes</h3>
            <div className="grid grid-cols-2 gap-2">
              {presetThemes.map((theme) => (
                <div
                  key={theme.name}
                  className="group relative cursor-pointer overflow-hidden rounded-md border p-2"
                  onClick={() => setTheme(theme)}
                >
                  <div 
                    className="absolute inset-0 z-10 bg-background/80 opacity-0 flex items-center justify-center group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: theme.scheme.backgroundColor + "CC" }}
                  >
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setTheme(theme)}
                    >
                      Apply
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <div className="space-y-1">
                      <div className="font-medium text-xs">{theme.name}</div>
                      <div 
                        className={`h-5 w-full rounded-md`} 
                        style={{ backgroundColor: theme.scheme.primaryColor }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div 
                        className="h-3 rounded-md" 
                        style={{ backgroundColor: theme.scheme.secondaryColor }}
                      />
                      <div 
                        className="h-3 rounded-md" 
                        style={{ backgroundColor: theme.scheme.accentColor }}
                      />
                      <div 
                        className="h-3 rounded-md flex items-center justify-center" 
                        style={{ 
                          backgroundColor: theme.scheme.backgroundColor,
                          color: theme.scheme.textColor,
                          fontSize: "0.5rem"
                        }}
                      >
                        Aa
                      </div>
                    </div>
                  </div>
                  {theme.name === activeTheme.name && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>

            {customThemes.length > 0 && (
              <>
                <h3 className="text-sm font-medium pt-4">Custom Themes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {customThemes.map((theme, index) => (
                    <div
                      key={theme.name}
                      className="group relative cursor-pointer overflow-hidden rounded-md border p-2"
                      onClick={() => setTheme(theme)}
                    >
                      <div 
                        className="absolute inset-0 z-10 bg-background/80 opacity-0 flex items-center justify-center gap-2 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: theme.scheme.backgroundColor + "CC" }}
                      >
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditTheme(index);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomTheme(theme.name);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        <div className="space-y-1">
                          <div className="font-medium text-xs">{theme.name}</div>
                          <div 
                            className={`h-5 w-full rounded-md`} 
                            style={{ backgroundColor: theme.scheme.primaryColor }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div 
                            className="h-3 rounded-md" 
                            style={{ backgroundColor: theme.scheme.secondaryColor }}
                          />
                          <div 
                            className="h-3 rounded-md" 
                            style={{ backgroundColor: theme.scheme.accentColor }}
                          />
                          <div 
                            className="h-3 rounded-md flex items-center justify-center" 
                            style={{ 
                              backgroundColor: theme.scheme.backgroundColor,
                              color: theme.scheme.textColor,
                              fontSize: "0.5rem"
                            }}
                          >
                            Aa
                          </div>
                        </div>
                      </div>
                      {theme.name === activeTheme.name && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => {
                resetThemeForm();
                setIsCreating(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Create New Theme
            </Button>
          </TabsContent>

          <TabsContent value="create">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="theme-name">Theme Name</Label>
                <Input 
                  id="theme-name" 
                  placeholder="My Custom Theme" 
                  value={newTheme.name}
                  onChange={(e) => setNewTheme(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch 
                  id="dark-mode"
                  checked={newTheme.isDark}
                  onCheckedChange={(checked) => setNewTheme(prev => ({ ...prev, isDark: checked }))}
                />
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border" 
                        style={{ backgroundColor: newTheme.scheme.primaryColor }} 
                      />
                      <Input 
                        id="primary-color"
                        type="text"
                        value={newTheme.scheme.primaryColor}
                        onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border" 
                        style={{ backgroundColor: newTheme.scheme.secondaryColor }} 
                      />
                      <Input 
                        id="secondary-color"
                        type="text"
                        value={newTheme.scheme.secondaryColor}
                        onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border" 
                        style={{ backgroundColor: newTheme.scheme.accentColor }} 
                      />
                      <Input 
                        id="accent-color"
                        type="text"
                        value={newTheme.scheme.accentColor}
                        onChange={(e) => handleColorChange("accentColor", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border" 
                        style={{ backgroundColor: newTheme.scheme.backgroundColor }} 
                      />
                      <Input 
                        id="background-color"
                        type="text"
                        value={newTheme.scheme.backgroundColor}
                        onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-md border" 
                      style={{ backgroundColor: newTheme.scheme.textColor }} 
                    />
                    <Input 
                      id="text-color"
                      type="text"
                      value={newTheme.scheme.textColor}
                      onChange={(e) => handleColorChange("textColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div 
                  className="rounded-md border p-4 space-y-4"
                  style={{ 
                    backgroundColor: newTheme.scheme.backgroundColor,
                    color: newTheme.scheme.textColor
                  }}
                >
                  <div 
                    className="text-lg font-bold"
                    style={{ color: newTheme.scheme.textColor }}
                  >
                    Theme Preview
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: newTheme.scheme.textColor + "99" }}
                  >
                    This is how your custom theme will look.
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="px-3 py-1 rounded-md text-sm font-medium"
                      style={{ 
                        backgroundColor: newTheme.scheme.primaryColor,
                        color: '#ffffff'
                      }}
                    >
                      Primary Button
                    </div>
                    <div 
                      className="px-3 py-1 rounded-md text-sm font-medium border"
                      style={{ 
                        backgroundColor: newTheme.scheme.secondaryColor,
                        color: newTheme.scheme.textColor,
                        borderColor: newTheme.scheme.textColor + "33"
                      }}
                    >
                      Secondary Button
                    </div>
                  </div>
                  <div 
                    className="rounded-md p-3 text-sm"
                    style={{ 
                      backgroundColor: newTheme.scheme.accentColor,
                      color: newTheme.scheme.textColor
                    }}
                  >
                    This is an accent container
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={resetThemeForm}
              >
                Cancel
              </Button>
              <Button 
                disabled={!newTheme.name.trim()} 
                onClick={handleSaveTheme}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingTheme !== null ? "Update Theme" : "Save Theme"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
