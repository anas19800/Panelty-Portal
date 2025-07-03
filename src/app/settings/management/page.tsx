'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2 } from 'lucide-react';
import {
  regions as initialRegions,
  brands as initialBrands,
  violationCategories as initialViolationCategories,
  ViolationCategory,
} from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

type SubCategoryManagerProps = {
  mainCategory: string;
  subCategories: string[];
  onAddSubCategory: (mainCategory: string, subCategory: string) => void;
  onDeleteSubCategory: (mainCategory: string, subCategory: string) => void;
};

function SubCategoryManager({ mainCategory, subCategories, onAddSubCategory, onDeleteSubCategory }: SubCategoryManagerProps) {
    const [newSubCategory, setNewSubCategory] = useState('');
    const { toast } = useToast();

    const handleAdd = () => {
        if (newSubCategory.trim() === '') {
            toast({ variant: 'destructive', description: 'لا يمكن إضافة فئة فرعية فارغة.' });
            return;
        }
        onAddSubCategory(mainCategory, newSubCategory);
        setNewSubCategory('');
    };

    return (
        <div className="space-y-3">
             <div className="flex gap-2">
                <Input value={newSubCategory} onChange={(e) => setNewSubCategory(e.target.value)} placeholder="إضافة فئة فرعية..." className="h-9"/>
                <Button onClick={handleAdd} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> إضافة</Button>
            </div>
             <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                {subCategories.map(sc => (
                    <li key={sc} className="flex items-center justify-between hover:bg-muted/50 rounded-md pr-2">
                       <span>{sc}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDeleteSubCategory(mainCategory, sc)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </li>
                ))}
                {subCategories.length === 0 && (
                    <li className="text-center text-sm py-2">لا توجد فئات فرعية.</li>
                )}
            </ul>
        </div>
    );
}


export default function ManagementPage() {
  const { toast } = useToast();
  const [regions, setRegions] = useState(initialRegions);
  const [brands, setBrands] = useState(initialBrands);
  const [categories, setCategories] = useState<ViolationCategory[]>(initialViolationCategories);
  
  const [newRegion, setNewRegion] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newMainCategory, setNewMainCategory] = useState('');

  const handleAddRegion = () => {
    if (newRegion.trim() !== '') {
      setRegions([...regions, newRegion.trim()]);
      setNewRegion('');
      toast({ description: "تمت إضافة المنطقة بنجاح." });
    } else {
      toast({ variant: "destructive", description: "لا يمكن إضافة منطقة فارغة." });
    }
  };
  const handleDeleteRegion = (regionToDelete: string) => {
    setRegions(regions.filter(r => r !== regionToDelete));
    toast({ description: "تم حذف المنطقة." });
  };

  const handleAddBrand = () => {
    if (newBrand.trim() !== '') {
      setBrands([...brands, newBrand.trim()]);
      setNewBrand('');
      toast({ description: "تمت إضافة البراند بنجاح." });
    } else {
      toast({ variant: "destructive", description: "لا يمكن إضافة براند فارغ." });
    }
  };
  const handleDeleteBrand = (brandToDelete: string) => {
    setBrands(brands.filter(b => b !== brandToDelete));
    toast({ description: "تم حذف البراند." });
  };

  const handleAddMainCategory = () => {
    if (newMainCategory.trim() !== '') {
      setCategories([...categories, { mainCategory: newMainCategory.trim(), subCategories: [] }]);
      setNewMainCategory('');
      toast({ description: "تمت إضافة الفئة الرئيسية بنجاح." });
    } else {
       toast({ variant: "destructive", description: "لا يمكن إضافة فئة رئيسية فارغة." });
    }
  };
  const handleDeleteMainCategory = (mainCategoryToDelete: string) => {
    setCategories(categories.filter(c => c.mainCategory !== mainCategoryToDelete));
    toast({ description: "تم حذف الفئة الرئيسية." });
  };
  const handleAddSubCategory = (mainCategory: string, subCategory: string) => {
     if (subCategory.trim() !== '') {
        const updatedCategories = categories.map(c => {
            if (c.mainCategory === mainCategory) {
                return { ...c, subCategories: [...c.subCategories, subCategory.trim()] };
            }
            return c;
        });
        setCategories(updatedCategories);
        toast({ description: "تمت إضافة الفئة الفرعية بنجاح." });
     }
  };
  const handleDeleteSubCategory = (mainCategory: string, subCategoryToDelete: string) => {
     const updatedCategories = categories.map(c => {
        if (c.mainCategory === mainCategory) {
            return { ...c, subCategories: c.subCategories.filter(sc => sc !== subCategoryToDelete) };
        }
        return c;
    });
    setCategories(updatedCategories);
    toast({ description: "تم حذف الفئة الفرعية." });
  };


  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="إدارة بيانات النظام" />
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brands">البراندات</TabsTrigger>
          <TabsTrigger value="regions">المناطق</TabsTrigger>
          <TabsTrigger value="categories">فئات المخالفات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <CardTitle>إدارة البراندات</CardTitle>
              <CardDescription>إضافة أو حذف البراندات التجارية في النظام.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="اسم البراند الجديد" />
                <Button onClick={handleAddBrand}><PlusCircle className="mr-2 h-4 w-4" /> إضافة</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم البراند</TableHead>
                    <TableHead className="w-[100px] text-left">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map(brand => (
                    <TableRow key={brand}>
                      <TableCell>{brand}</TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBrand(brand)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions">
           <Card>
            <CardHeader>
              <CardTitle>إدارة المناطق</CardTitle>
              <CardDescription>إضافة أو حذف المناطق التشغيلية في النظام.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input value={newRegion} onChange={(e) => setNewRegion(e.target.value)} placeholder="اسم المنطقة الجديدة" />
                <Button onClick={handleAddRegion}><PlusCircle className="mr-2 h-4 w-4" /> إضافة</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المنطقة</TableHead>
                    <TableHead className="w-[100px] text-left">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map(region => (
                    <TableRow key={region}>
                      <TableCell>{region}</TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRegion(region)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
            <Card>
                <CardHeader>
                    <CardTitle>إدارة فئات المخالفات</CardTitle>
                    <CardDescription>إدارة الفئات الرئيسية والفرعية للمخالفات.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                         <Input value={newMainCategory} onChange={(e) => setNewMainCategory(e.target.value)} placeholder="اسم الفئة الرئيسية الجديدة" />
                        <Button onClick={handleAddMainCategory}><PlusCircle className="mr-2 h-4 w-4" /> إضافة فئة رئيسية</Button>
                    </div>
                     <Accordion type="multiple" className="w-full" defaultValue={[categories[0]?.mainCategory]}>
                        {categories.map((category) => (
                           <AccordionItem value={category.mainCategory} key={category.mainCategory}>
                                <div className="flex items-center w-full hover:bg-muted/50 rounded-md">
                                    <AccordionTrigger className="flex-1 px-4 py-2">{category.mainCategory}</AccordionTrigger>
                                     <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleDeleteMainCategory(category.mainCategory)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                                <AccordionContent>
                                    <div className="pt-2 pl-4 pr-8 space-y-2 border-r-2 border-border mr-6">
                                        <SubCategoryManager 
                                            mainCategory={category.mainCategory} 
                                            subCategories={category.subCategories}
                                            onAddSubCategory={handleAddSubCategory}
                                            onDeleteSubCategory={handleDeleteSubCategory}
                                        />
                                    </div>
                                </AccordionContent>
                           </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
