// Find the roots of a quadratic equation (also check whether the roots are real or complex); user will input the coefficients
#include<stdio.h>
#include<math.h>
int main()
{
    int a,b,c,bsq;
    float x,root,postp,negtp,posc,negc;
    printf("enter the value of a: ");
    scanf("%d",&a);
    printf("enter the value of b: ");
    scanf("%d",&b);
    printf("enter the value of c: ");
    scanf("%d",&c);
    bsq = b*b;
    x = (bsq-(4*a*c));
    if(x < 0)
    {
        printf("\nthe roots are imaginary\n");
        return 0;
    }
    //printf("x = %5f\n",x);
    root = sqrt(x);
    //printf("root = %5f\n",root);
    postp = (-b + root);
    //printf("postp = %5f\n",postp);
    negtp = (-b - root);
    //printf("negtp = %5f\n",negtp);
    posc = postp / (2 * a);
    //printf("posc = %5f\n",posc);
    negc = negtp / (2 * a);
    //printf("negc = %5f\n",negc);
    printf("\nthe roots are real and the values are %5f and %5f\n",posc,negc);
    return 0;
}