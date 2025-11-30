// asterick pyramid in downside
#include <stdio.h>
int main() {
    int i, j, space;
    for (i = 10; i >= 1; --i) {
        for (space = 1; space <= 10 - i; ++space) {
            printf(" ");
        }
        for (j = 1; j <= 2 * i - 1; ++j) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
