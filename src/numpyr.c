// Print the following pattern:
//    1
//    12
//    123
//    1234
//    12345
//    123456
//    1234567
//    12345678
//    123456789     
#include<stdio.h>
int main()
{
    int a,b;
    for(a = 1; a <= 9; a++)
    {
        for(b = 1; b <= a; b++)
        {
            printf("%d",b);
        }
        printf("\n");
    }
    return 0;
}