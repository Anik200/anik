// fibonacci series
#include<stdio.h>
int main()
{
    long cur = 1,prev = 0,sum,next = 1,count = 0; 
    printf("%ld,%ld,",prev,cur);
    while(count < 120)
    {    
        printf("%ld,",next);
        sum = cur + next;
        prev = cur;
        cur = next;
        next = sum;
        count++;
    }
    return 0;
}