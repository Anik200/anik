// Write a program to multiply two matrices of order m x n and n x p and then display the product as well as the transpose of that product.
#include <stdio.h>
int main() {
    int x, y, z;
    int i, j, k;
    printf("Enter number of rows for first matrix: ");
    scanf("%d", &x);
    printf("Enter number of columns for first matrix (and rows for second): ");
    scanf("%d", &y);
    printf("Enter number of columns for second matrix: ");
    scanf("%d", &z);
    int A[50][50], B[50][50], Z[50][50], T[50][50];
    printf("Enter elements of first matrix A (%d x %d):\n", x, y);
    for (i = 0; i < x; i++) {
        for (j = 0; j < y; j++) {
            scanf("%d", &A[i][j]);
        }
    }
    printf("Enter elements of second matrix B (%d x %d):\n", y, z);
    for (i = 0; i < y; i++) {
        for (j = 0; j < z; j++) {
            scanf("%d", &B[i][j]);
        }
    }
    for (i = 0; i < x; i++) {
        for (j = 0; j < z; j++) {
            Z[i][j] = 0;
        }
    }
    for (i = 0; i < x; i++) {
        for (j = 0; j < z; j++) {
            for (k = 0; k < y; k++) {
                Z[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    printf("Product matrix Z (%d x %d):\n", x, z);
    for (i = 0; i < x; i++) {
        for (j = 0; j < z; j++) {
            printf("%d ", Z[i][j]);
        }
        printf("\n");
    }
    for (i = 0; i < x; i++) {
        for (j = 0; j < z; j++) {
            T[j][i] = Z[i][j];
        }
    }
    printf("Transpose of product matrix Z (%d x %d):\n", z, x);
    for (i = 0; i < z; i++) {
        for (j = 0; j < x; j++) {
            printf("%d ", T[i][j]);
        }
        printf("\n");
    }
    return 0;
}
