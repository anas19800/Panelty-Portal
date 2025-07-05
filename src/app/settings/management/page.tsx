'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ViolationCategory, ViolationSubCategory } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { PageGuard } from '@/context/auth-context';
import { PERMISSIONS } from '@/lib/permissions';
import { useTranslation } from 'react-i18next';

type DbRegion = { id: string; name: string; };
type DbBrand = { id: string; name: string; };
type DbCategory = ViolationCategory & { id: string; };

type SubCategoryManagerProps = {
  mainCategory: DbCategory;
  onAddSubCategory: (mainCategoryId: string, subCategory: ViolationSubCategory) => void;
  onDeleteSubCategory: (mainCategoryId: string, subCategoryCode: string) => void;
};

function SubCategoryManager({ mainCategory, onAddSubCategory, onDeleteSubCategory }: SubCategoryManagerProps) {
    const { t } = useTranslation();
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [newSubCategoryCode, setNewSubCategoryCode] = useState('');
    const { toast } = useToast();

    const handleAdd = () => {
        if (newSubCategoryName.trim() === '' || newSubCategoryCode.trim() === '') {
            toast({ variant: 'destructive', description: t('management.toasts.subCatCodeRequired') });
            return;
        }
        if (mainCategory.subCategories.some(sc => sc.code === newSubCategoryCode.trim())) {
            toast({ variant: "destructive", description: t('management.toasts.subCatCodeExists') });
            return;
        }
        onAddSubCategory(mainCategory.id, { code: newSubCategoryCode, name: newSubCategoryName });
        setNewSubCategoryName('');
        setNewSubCategoryCode('');
    };

    return (
        <div className="space-y-3">
             <div className="flex gap-2">
                <Input value={newSubCategoryCode} onChange={(e) => setNewSubCategoryCode(e.target.value)} placeholder={t('management.categories.subCatCodePlaceholder')} className="h-9 w-24"/>
                <Input value={newSubCategoryName} onChange={(e) => setNewSubCategoryName(e.target.value)} placeholder={t('management.categories.subCatNamePlaceholder')} className="h-9 flex-1"/>
                <Button onClick={handleAdd} size="sm"><PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> {t('management.categories.addSubCat')}</Button>
            </div>
             <ul className="space-y-1 list-inside text-muted-foreground">
                {mainCategory.subCategories.map(sc => (
                    <li key={sc.code} className="flex items-center justify-between hover:bg-muted/50 rounded-md pr-2 rtl:pr-0 rtl:pl-2">
                       <div className="flex items-center gap-2">
                         <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">{sc.code}</span>
                         <span>{sc.name}</span>
                       </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDeleteSubCategory(mainCategory.id, sc.code)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </li>
                ))}
                {mainCategory.subCategories.length === 0 && <li className="text-center text-sm py-2">{t('management.categories.noSubCats')}</li>}
            </ul>
        </div>
    );
}

function ManagementPageContent() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [regions, setRegions] = useState<DbRegion[]>([]);
  const [brands, setBrands] = useState<DbBrand[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [newRegion, setNewRegion] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newMainCategory, setNewMainCategory] = useState('');
  const [newMainCategoryCode, setNewMainCategoryCode] = useState('');

  useEffect(() => {
    async function fetchData() {
        try {
            const [regionsSnapshot, brandsSnapshot, categoriesSnapshot] = await Promise.all([
                getDocs(collection(db, 'regions')),
                getDocs(collection(db, 'brands')),
                getDocs(collection(db, 'violationCategories'))
            ]);

            setRegions(regionsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
            setBrands(brandsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
            setCategories(categoriesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DbCategory)));
        } catch (error) {
            console.error("Failed to load data from Firestore", error);
            toast({ variant: 'destructive', description: t('management.toasts.loadError') });
        } finally {
            setIsLoaded(true);
        }
    }
    fetchData();
  }, [toast, t]);

  const handleAddSimpleItem = async (collectionName: 'regions' | 'brands', value: string, setValue: (v: string) => void, currentItems: {name: string}[]) => {
    if (value.trim() === '') {
      toast({ variant: "destructive", description: t('management.toasts.addEmptyError') });
      return;
    }
    if (currentItems.some(item => item.name === value.trim())) {
      toast({ variant: "destructive", description: t('management.toasts.addDuplicateError') });
      return;
    }
    try {
      const docRef = await addDoc(collection(db, collectionName), { name: value.trim() });
      const stateSetter = collectionName === 'regions' ? setRegions : setBrands;
      stateSetter(prev => [...prev, { id: docRef.id, name: value.trim() }] as any);
      setValue('');
      toast({ description: t('management.toasts.addSuccess') });
    } catch (error) {
      toast({ variant: "destructive", description: t('management.toasts.saveError') });
    }
  };

  const handleDeleteSimpleItem = async (collectionName: 'regions' | 'brands', id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      const stateSetter = collectionName === 'regions' ? setRegions : setBrands;
      stateSetter(prev => prev.filter(item => item.id !== id));
      toast({ description: t('management.toasts.deleteSuccess') });
    } catch (error) {
      toast({ variant: "destructive", description: t('management.toasts.deleteError') });
    }
  };

  const handleAddMainCategory = async () => {
    if (newMainCategory.trim() === '' || newMainCategoryCode.trim() === '') {
       toast({ variant: "destructive", description: t('management.toasts.mainCatCodeRequired') }); return;
    }
    if (categories.some(c => c.mainCategoryCode === newMainCategoryCode.trim())) {
      toast({ variant: "destructive", description: t('management.toasts.mainCatCodeExists') }); return;
    }
    try {
      const newCategoryData = { mainCategoryCode: newMainCategoryCode.trim(), mainCategory: newMainCategory.trim(), subCategories: [] };
      const docRef = await addDoc(collection(db, "violationCategories"), newCategoryData);
      setCategories([...categories, { ...newCategoryData, id: docRef.id }]);
      setNewMainCategory(''); setNewMainCategoryCode('');
      toast({ description: t('management.toasts.mainCatAddSuccess') });
    } catch (error) {
       toast({ variant: "destructive", description: t('management.toasts.mainCatSaveError') });
    }
  };
  
  const handleDeleteMainCategory = async (id: string) => {
    try {
        await deleteDoc(doc(db, "violationCategories", id));
        setCategories(categories.filter(c => c.id !== id));
        toast({ description: t('management.toasts.mainCatDeleteSuccess') });
    } catch (error) {
        toast({ variant: "destructive", description: t('management.toasts.mainCatDeleteError') });
    }
  };
  
  const handleAddSubCategory = async (mainCategoryId: string, subCategory: ViolationSubCategory) => {
    const category = categories.find(c => c.id === mainCategoryId);
    if (!category) return;
    const updatedSubCategories = [...category.subCategories, subCategory];
    try {
        await updateDoc(doc(db, "violationCategories", mainCategoryId), { subCategories: updatedSubCategories });
        setCategories(categories.map(c => c.id === mainCategoryId ? { ...c, subCategories: updatedSubCategories } : c));
        toast({ description: t('management.toasts.subCatAddSuccess') });
    } catch (error) {
        toast({ variant: "destructive", description: t('management.toasts.subCatSaveError') });
    }
  };

  const handleDeleteSubCategory = async (mainCategoryId: string, subCategoryCodeToDelete: string) => {
    const category = categories.find(c => c.id === mainCategoryId);
    if (!category) return;
    const updatedSubCategories = category.subCategories.filter(sc => sc.code !== subCategoryCodeToDelete);
    try {
        await updateDoc(doc(db, "violationCategories", mainCategoryId), { subCategories: updatedSubCategories });
        setCategories(categories.map(c => c.id === mainCategoryId ? { ...c, subCategories: updatedSubCategories } : c));
        toast({ description: t('management.toasts.subCatDeleteSuccess') });
    } catch (error) {
        toast({ variant: "destructive", description: t('management.toasts.subCatDeleteError') });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t('management.title')} />
        <Card><CardHeader><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('management.title')} />
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brands">{t('management.tabs.brands')}</TabsTrigger>
          <TabsTrigger value="regions">{t('management.tabs.regions')}</TabsTrigger>
          <TabsTrigger value="categories">{t('management.tabs.categories')}</TabsTrigger>
        </TabsList>
        <TabsContent value="brands">
          <Card>
            <CardHeader><CardTitle>{t('management.brands.title')}</CardTitle><CardDescription>{t('management.brands.description')}</CardDescription></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder={t('management.brands.placeholder')} />
                <Button onClick={() => handleAddSimpleItem('brands', newBrand, setNewBrand, brands)}><PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> {t('management.brands.add')}</Button>
              </div>
              <Table><TableHeader><TableRow><TableHead>{t('management.brands.tableHeader')}</TableHead><TableHead className="w-[100px] text-left rtl:text-right">{t('nav.actions')}</TableHead></TableRow></TableHeader>
                <TableBody>{brands.map(brand => (<TableRow key={brand.id}><TableCell>{brand.name}</TableCell><TableCell className="text-left rtl:text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteSimpleItem('brands', brand.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>))}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="regions">
           <Card>
            <CardHeader><CardTitle>{t('management.regions.title')}</CardTitle><CardDescription>{t('management.regions.description')}</CardDescription></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input value={newRegion} onChange={(e) => setNewRegion(e.target.value)} placeholder={t('management.regions.placeholder')} />
                <Button onClick={() => handleAddSimpleItem('regions', newRegion, setNewRegion, regions)}><PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> {t('management.regions.add')}</Button>
              </div>
              <Table><TableHeader><TableRow><TableHead>{t('management.regions.tableHeader')}</TableHead><TableHead className="w-[100px] text-left rtl:text-right">{t('nav.actions')}</TableHead></TableRow></TableHeader>
                <TableBody>{regions.map(region => (<TableRow key={region.id}><TableCell>{region.name}</TableCell><TableCell className="text-left rtl:text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteSimpleItem('regions', region.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>))}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
            <Card>
                <CardHeader><CardTitle>{t('management.categories.title')}</CardTitle><CardDescription>{t('management.categories.description')}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                         <Input value={newMainCategoryCode} onChange={(e) => setNewMainCategoryCode(e.target.value)} placeholder={t('management.categories.mainCatCodePlaceholder')} className="w-32" />
                         <Input value={newMainCategory} onChange={(e) => setNewMainCategory(e.target.value)} placeholder={t('management.categories.mainCatNamePlaceholder')} className="flex-1" />
                        <Button onClick={handleAddMainCategory}><PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> {t('management.categories.addMainCat')}</Button>
                    </div>
                     <Accordion type="multiple" className="w-full" defaultValue={categories.length > 0 ? [categories[0].id] : []}>
                        {categories.map((category) => (
                           <AccordionItem value={category.id} key={category.id}>
                                <div className="flex items-center w-full hover:bg-muted/50 rounded-md">
                                    <AccordionTrigger className="flex-1 px-4 py-2 text-right rtl:text-left">
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm bg-muted rounded px-2 py-1">{category.mainCategoryCode}</span>
                                        <span>{category.mainCategory}</span>
                                      </div>
                                    </AccordionTrigger>
                                     <Button variant="ghost" size="icon" className="mr-2 rtl:ml-2 rtl:mr-0" onClick={() => handleDeleteMainCategory(category.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                                <AccordionContent>
                                    <div className="pt-2 pl-4 pr-8 space-y-2 border-r-2 rtl:border-r-0 rtl:border-l-2 border-border mr-6 rtl:mr-0 rtl:ml-6">
                                        <SubCategoryManager mainCategory={category} onAddSubCategory={handleAddSubCategory} onDeleteSubCategory={handleDeleteSubCategory} />
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

export default function ManagementPage() {
    return (
        <PageGuard feature={PERMISSIONS.MANAGEMENT} requiredPermission="write">
            <ManagementPageContent />
        </PageGuard>
    )
}
