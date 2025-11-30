// Given 3 sides, check whether a triangle is possible to be made and also find whether the triangle is right-angled, isosceles, equilateral or others
#include<stdio.h>
int main()
{
    int a,b,c,asq,bsq,csq;
    printf("enter the first side: ");
    scanf("%d",&a);
    printf("enter the second side: ");
    scanf("%d",&b);
    printf("enter the third side: ");
    scanf("%d",&c);
    while(a != 0 || b != 0 || c !=0)
    {
        if(a==b && b==c && a==c)
        {
            printf("the triangle is possible and is an equilateral\n");
            return 0;
        }
        if(a==b || b==c || a==c)
        {
            printf("the triangle is possible and is an isosceles\n");
            return 0; 
        }
        if(a + b > c || a + c > b || b + c > a)
        {
            asq = a*a;
            bsq = b*b;
            csq = c*c;
            if(asq + bsq == csq || asq + csq == bsq || bsq + csq == asq)
            {
                printf("the triangle is possible and is right angled\n");
                return 0;
            }
            printf("the triangle is possible and is of an other type\n");
            return 0;
        }
        printf("the triangle is not possible\n");
        return 0;
    }
    printf("the triangle is not possible\n");
    return 0;
}